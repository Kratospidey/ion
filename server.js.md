# server.js

### Technical Documentation for Chat Application Server

#### Introduction

This documentation provides detailed insights into the server-side functionalities of a chat application, covering the setup of environment variables, middleware integration, authentication mechanisms, real-time communication setup, and file upload handling.

#### Environment Configuration

*   **dotenv**: Used for loading environment variables from a `.env` file to manage sensitive information like database credentials and API keys securely.

    {% code lineNumbers="true" %}
    ```javascript
    require("dotenv").config();
    ```
    {% endcode %}

#### Library Imports

* **Core Libraries**: The application uses `express` for the server framework, `cookie-parser` for parsing cookies, `jsonwebtoken` for handling JWTs, and `sequelize` for ORM functionalities.
* **File Upload and Emoji Conversion**: Implements `multer` for handling file uploads and `emoji-js` for converting emoji shortcodes to Unicode.

{% code lineNumbers="true" %}
```javascript

const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { Sequelize, Op } = require("sequelize");
const multer = require("multer");
const EmojiConvertor = require("emoji-js");
```
{% endcode %}

#### Database and ORM Configuration

* **Sequelize**: Establishes a connection with the database and imports models such as `User`, `Server`, `ServerUser`, and `Message` to interact with database tables.

<pre class="language-javascript" data-line-numbers><code class="lang-javascript">const db = require("./models/index");
<strong>const sequelize = db.sequelize;
</strong>sequelize.authenticate();
</code></pre>

#### Express Server Setup and Middleware Configuration

* **Server and Middleware**: Sets up an Express app, configuring middleware for CORS, cookie parsing, and body parsing. It also serves static files and sets EJS as the view engine.
* **HTTPS Redirection Middleware**: Ensures secure communication by redirecting HTTP requests to HTTPS in production environments.

{% code lineNumbers="true" %}
```javascript
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
```
{% endcode %}

#### Google Cloud Storage for File Uploads

* **Google Cloud Storage Configuration**: Integrates Google Cloud Storage for file uploads, using credentials from environment variables.

{% code lineNumbers="true" %}
```javascript
const googleStorage = new Storage({ credentials: googleCredentials });
const bucket = googleStorage.bucket(bucketName);
```
{% endcode %}

#### Authentication and JWT Handling

* **JWT Secret Key**: Utilizes a secret key from environment variables for signing and verifying JWTs.

{% code lineNumbers="true" %}
```javascript
const SECRET_KEY = process.env.JWT_SECRET;
```
{% endcode %}

#### Route Definitions and Functionalities

**Login Routes**

* **GET /login**: Renders the login page, redirecting authenticated users to the home page based on token validation.
* **POST /login**: Authenticates users by verifying credentials, generating a JWT for successful logins, and setting it in the user's cookies.

{% code lineNumbers="true" %}
```javascript
app.get("/login", (req, res) => {
	// Always render the login page regardless of any existing tokens or user state
	res.render("login");
});

/**
 * Route to handle user login. It checks the user's credentials, and if valid, a JWT token is generated and sent back to the client.
 *
 * @route POST /login
 * @param {string} req.body.email - The email of the user attempting to log in.
 * @param {string} [req.body.username] - The username of the user attempting to log in (alternative to email).
 * @param {string} req.body.password - The password of the user.
 * @access Public
 */
app.post("/login", async (req, res) => {
	try {
		const { email, username, password } = req.body;

		// Initialize a query object
		let query = {};

		// Check if email or username was provided and adjust the query accordingly
		if (email) {
			query.email = email;
		} else if (username) {
			query.username = username;
		}

		// Find the user by email or username
		const user = await User.findOne({ where: query });

		if (!user) {
			return res.status(401).send("User not found");
		}

		// Compare the provided password with the stored hashed password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).send("Invalid password");
		}

		// If the login credentials are valid, generate a JWT and send it back to the client
		const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
			expiresIn: "7d",
		});
		res.cookie("token", token, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
		});
		res.status(200).send("Logged in successfully");
	} catch (err) {
		console.error("Error during login:", err);
		res.status(500).send("Internal server error");
	}
});
```
{% endcode %}

**Home Route**

* **GET /home**: Fetches and displays servers that the authenticated user is part of, redirecting to the onboarding page if the user is not part of any servers.

{% code lineNumbers="true" %}
```javascript
/**
 * Route to display the home page for the authenticated user. It fetches and displays servers that the user is a part of.
 *
 * @route GET /home
 * @access Private (requires authentication)
 */
app.get("/home", authenticateToken, async (req, res) => {
	try {
		const user = await User.findByPk(req.user.userId, {
			include: [
				{
					model: Server,
					as: "Servers", // Make sure this alias matches your association alias
					through: { attributes: [] },
					attributes: [
						"id",
						"name",
						"profilePicture",
						"filePaths",
						"createdAt",
						"updatedAt",
					],
				},
			],
		});

		// Check if the user is part of any servers
		if (user && user.Servers.length > 0) {
			// User is part of one or more servers, render the home page with the servers
			res.render("layout", { servers: user.Servers, showMembers: false });
		} else {
			// User is not part of any servers, redirect to the onboarding page
			res.redirect("/onboarding");
		}
	} catch (err) {
		console.error("Error fetching servers or redirecting user:", err);
		res.status(500).send("Internal server error");
	}
});
```
{% endcode %}

**Server Route**

* **GET /server/:serverId**: Displays a specific server based on the server ID if the authenticated user is a member, including server and user details.

{% code lineNumbers="true" %}
```javascript
/**
 * Route to display a specific server by its ID. It checks if the user is a member of the server and displays it if they are.
 *
 * @route GET /server/:serverId
 * @param {string} req.params.serverId - The ID of the server to display.
 * @access Private (requires authentication and server membership)
 */
app.get("/server/:serverId", authenticateToken, async (req, res) => {
	try {
		const server = await Server.findByPk(req.params.serverId, {
			include: [
				{
					model: User,
					as: "Users",
					attributes: ["id", "username", "email", "profilePicture"],
					through: { attributes: [] },
				},
			],
		});

		if (!server) {
			return res.status(404).send("Server not found.");
		}

		const isMember = server.Users.some((user) => user.id === req.user.userId);
		if (!isMember) {
			return res.status(403).send("User is not a member of this server.");
		}

		const userServers = await User.findByPk(req.user.userId, {
			include: [
				{
					model: Server,
					as: "Servers",
					attributes: ["id", "name", "profilePicture", "filePaths"],
					through: { attributes: [] },
				},
			],
		});

		// Validate file paths before rendering
		// server.filePaths = await validateFilePaths(
		// 	server.filePaths || [],
		// 	server.id
		// );

		res.render("layout", {
			servers: userServers ? userServers.Servers : [],
			members: server.Users,
			showMembers: true,
			currentServer: server,
			serverCode: server.serverCode,
			id: server.id,
		});
	} catch (err) {
		console.error("Error:", err);
		res.status(500).send("Internal server error");
	}
});
```
{% endcode %}

**File Upload Route**

* **POST /upload**: Handles file uploads to a specified server for authenticated and authorized users, validating file constraints and updating server information with the file path.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for uploading files to a specific server. It validates the user's membership in the server and the file constraints before uploading.
 *
 * @route POST /upload
 * @param {string} req.body.serverId - The ID of the server where the file is to be uploaded.
 * @param {file} req.file - The file to upload.
 * @access Private (requires authentication and server membership)
 */
app.post(
	"/upload",
	upload.single("file"),
	authenticateToken,
	async (req, res) => {
		try {
			const serverId = req.body.serverId;
			const userId = req.user.userId;

			// Check if there's an entry in the ServerUser join table for this user and server
			const serverUser = await ServerUser.findOne({
				where: {
					serverId: serverId,
					userId: userId,
				},
			});

			if (!serverUser) {
				return res
					.status(404)
					.send("Server not found or user is not a member.");
			}

			// Check the number of files already uploaded
			const server = await Server.findByPk(serverId);
			if (!server) {
				return res.status(404).send("Server not found.");
			}

			if (server.filePaths && server.filePaths.length >= 10) {
				return res
					.status(400)
					.json({ message: "You can only upload up to 10 files." });
			}

			// Check the size of the uploaded file
			if (req.file.size > 20 * 1024 * 1024) {
				// 20 MB
				return res
					.status(400)
					.json({ message: "File cannot be larger than 20 MB." });
			}

			// Create a new blob in the bucket and upload the file data
			const blob = bucket.file(`${serverId}/${req.file.originalname}`);
			const blobStream = blob.createWriteStream({
				resumable: true,
			});

			blobStream.on("error", (err) => {
				console.error(err);
				res.status(500).send("Error uploading to Google Cloud Storage.");
			});

			blobStream.on("finish", async () => {
				// Make the file public and get its public URL
				const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

				// Update the server's filePaths array
				const updatedFilePaths = server.filePaths
					? [...server.filePaths, publicUrl]
					: [publicUrl];
				await server.update({ filePaths: updatedFilePaths });

				// Send a response to the client
				res
					.status(200)
					.json({ message: "File uploaded successfully", filePath: publicUrl });
			});

			blobStream.end(req.file.buffer);
		} catch (err) {
			console.error("Error uploading file:", err);
			res.status(500).send("Internal server error");
		}
	}
);
```
{% endcode %}

#### Real-time Communication with Socket.IO

*   **Socket.IO Setup**: Enables real-time bidirectional event-based communication between clients and the server, essential for chat functionalities.

    ```javascript
    const io = require("socket.io")(server, { cors: {...} });
    ```

#### Authentication Middleware

**`authenticateToken(req, res, next)`**

This middleware function authenticates incoming requests by verifying the JWT token stored in cookies. If the token is valid, the decoded information is attached to the request object; otherwise, it responds with an appropriate HTTP error.

{% code lineNumbers="true" fullWidth="false" %}
```javascript
/**
 * Middleware function to authenticate the incoming requests by verifying the JWT token stored in cookies.
 * It checks for the presence of a 'token' cookie and attempts to verify it. If the verification is successful,
 * the decoded token information is attached to the request object (req.user).
 * If the token is missing, invalid, or expired, an appropriate HTTP status code and message are sent back.
 *
 * @param {Object} req - The request object, containing cookies among other properties.
 * @param {Object} res - The response object, used to send back the HTTP response.
 * @param {Function} next - The next middleware function in the stack.
 */
function authenticateToken(req, res, next) {
	const token = req.cookies.token;
	if (!token) {
		return res.status(401).send("Access denied. No token provided.");
	}

	try {
		const decoded = jwt.verify(token, SECRET_KEY);
		req.user = decoded;
		// console.log(`auth token ${req.user.userId}`); // Debugging line
		next();
	} catch (ex) {
		console.error("Token verification failed:", ex);
		if (ex instanceof jwt.JsonWebTokenError) {
			// Invalid signature or malformed token
			return res.status(401).send("Invalid token.");
		} else if (ex instanceof jwt.NotBeforeError) {
			// Token used before its nbf claim
			return res.status(401).send("Token used before its valid date.");
		} else if (ex instanceof jwt.TokenExpiredError) {
			// Token expired
			return res.status(401).send("Token expired.");
		} else {
			// Other errors
			return res
				.status(400)
				.send("An error occurred while verifying the token.");
		}
	}
}
```
{% endcode %}

#### User Registration and Profile Management

**Sign-up Page Rendering**

**`GET /signup`**

Renders the sign-up page allowing new users to register. This route is publicly accessible.

```javascript
app.get("/signup", (req, res) => {
    res.render("signup");
});
```

**User Registration**

**`POST /signup`**

Handles the registration of new users, including validations and profile picture upload. On successful registration, the user is redirected to the onboarding page.

{% code lineNumbers="true" %}
```javascript
/**
 * Route handler for POST requests to the "/signup" endpoint. It processes the sign-up form submission, including user details
 * and a profile picture. It performs validations such as checking for existing users with the same email or username, password
 * matching, and minimum password length. If validations pass, the user's password is hashed, and their profile picture is uploaded
 * to Google Cloud Storage. Upon successful registration, the user is redirected to the onboarding page.
 *
 * @route POST /signup
 * @access Public
 * @param {Object} req - The Express request object containing the user's sign-up information and the uploaded profile picture.
 * @param {Object} res - The Express response object used to send the HTTP response.
 */
app.post("/signup", upload.single("profilePicture"), async (req, res) => {
	try {
		const { username, email, password, confirmPassword } = req.body;
		const lowerCaseUsername = username.toLowerCase();

		// Check if user with the same email already exists
		const existingUserByEmail = await User.findOne({ where: { email } });
		if (existingUserByEmail) {
			return res.status(409).send("A user with this email already exists.");
		}

		// Check if user with the same username already exists
		const existingUserByUsername = await User.findOne({
			where: { username: lowerCaseUsername },
		});
		if (existingUserByUsername) {
			return res.status(409).send("A user with this username already exists.");
		}

		// Validate input and passwords match
		if (password !== confirmPassword) {
			return res.status(400).send("Passwords do not match.");
		}

		// Check if the password is at least 8 characters long
		if (password.length < 8) {
			return res
				.status(400)
				.send("Password must be at least 8 characters long.");
		}

		// Check if profile picture is uploaded
		if (!req.file) {
			return res.status(400).send("Profile picture is required.");
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Upload the profile picture to Google Cloud Storage
		const file = req.file;
		const blob = bucket.file(
			`users/profile-pictures/${Date.now()}-${file.originalname}`
		);
		const blobStream = blob.createWriteStream({ resumable: true });

		blobStream.on("error", (err) => {
			console.error(err);
			return res.status(500).send("Error uploading to Google Cloud Storage.");
		});

		blobStream.on("finish", async () => {
			// Make the file public and get its public URL
			const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

			// Create the user with the public URL of the profile picture
			const user = await User.create({
				username: lowerCaseUsername,
				email,
				password: hashedPassword,
				profilePicture: publicUrl,
			});

			// Generate a token for the user
			const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
				expiresIn: "1d",
			});
			res.cookie("token", token, { httpOnly: true });

			// Redirect to the onboarding page after successful signup
			res.redirect("/onboarding");
		});

		blobStream.end(file.buffer);
	} catch (err) {
		console.error("Error during sign-up:", err.message);
		res.status(500).send("Internal server error.");
	}
});
```
{% endcode %}

**Onboarding Page Rendering**

**`GET /onboarding`**

Renders the onboarding page for newly registered users, guiding them through initial setup. This route requires authentication.

{% code lineNumbers="true" %}
```javascript
/**
 * Route handler for GET requests to the "/onboarding" endpoint. It renders the onboarding page for newly registered users
 * to guide them through initial setup or introductions. This route requires the user to be authenticated; unauthenticated users
 * are redirected to the login page by the "authenticateToken" middleware.
 *
 * @route GET /onboarding
 * @access Private (requires authentication)
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object used to render the onboarding page.
 */
app.get("/onboarding", authenticateToken, (req, res) => {
	res.render("onboarding");
});
```
{% endcode %}

#### Server Management

**Create Server**

**`POST /create-server`**

Allows authenticated users to create a new server with a mandatory profile picture. The server creator automatically becomes a member of the server.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for creating a new server with a mandatory server profile picture. The creator of the server automatically becomes a member.
 *
 * @route POST /create-server
 * @param {string} req.body.serverName - The name of the new server.
 * @param {file} req.file - The profile picture for the new server.
 * @access Private (requires authentication)
 */
app.post(
	"/create-server",
	[authenticateToken, upload.single("serverProfilePicture")], // Use 'upload' middleware for single file upload
	async (req, res) => {
		try {
			const { serverName } = req.body;
			const userId = req.user.userId;

			// Check if a server with the same name already exists
			const existingServer = await Server.findOne({
				where: { name: serverName },
			});
			if (existingServer) {
				return res.status(409).send("A server with this name already exists.");
			}

			// Check if server profile picture is uploaded
			if (!req.file) {
				return res.status(400).send("No profile picture attached.");
			}

			// Proceed with file upload and server creation
			const file = req.file;
			const blob = bucket.file(`servers/${Date.now()}-${file.originalname}`);
			const blobStream = blob.createWriteStream({ resumable: false });

			blobStream.on("error", (err) => {
				console.error(err);
				return res.status(500).send("Error uploading to Google Cloud Storage.");
			});

			blobStream.on("finish", async () => {
				// Make the file public and get its public URL
				const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

				// Create the server with the public URL of the profile picture
				const server = await Server.create({
					name: serverName,
					profilePicture: publicUrl,
					filePaths: [],
					ownerId: userId, // Set ownerId to the userId extracted from the JWT token
				});

				// Add the current user to the server as a member
				await server.addUser(userId);

				res.status(201).json({
					redirectUrl: "/home",
				});
			});

			blobStream.end(file.buffer);
		} catch (err) {
			console.error("Error creating server:", err);
			res.status(500).send("Internal server error.");
		}
	}
);
```
{% endcode %}

**Join Server**

**`POST /join-server`**

Enables authenticated users to join an existing server using a unique server code.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for joining an existing server using a unique server code.
 *
 * @route POST /join-server
 * @param {string} req.body.serverCode - The unique code of the server to join.
 * @access Private (requires authentication)
 */
app.post("/join-server", authenticateToken, async (req, res) => {
	try {
		const { serverCode } = req.body;
		// Find the server by its unique code
		const server = await Server.findOne({ where: { serverCode } });

		if (!server) {
			return res.status(404).send("Server not found.");
		}

		// Retrieve the ServerUser model which is the join table between Server and User
		const ServerUser = db.ServerUser; // Directly use the imported model

		// Check if the user is already a member of the server to prevent duplicate entries
		const existingMember = await ServerUser.findOne({
			where: {
				serverId: server.id,
				userId: req.user.userId,
			},
		});

		if (existingMember) {
			return res.status(409).send("User is already a member of this server.");
		}

		// Add the current user to the server if not already a member
		await ServerUser.create({
			serverId: server.id,
			userId: req.user.userId,
		});

		res.status(200).json({
			redirectUrl: "/home",
		});
	} catch (err) {
		console.error("Error joining server:", err);
		res.status(500).send("Internal server error.");
	}
});
```
{% endcode %}

#### Utility Functions

**`sanitizeFilename(filename)`**

Sanitizes filenames by replacing non-alphanumeric and special characters with underscores, ensuring filenames are safe for storage.

{% code lineNumbers="true" %}
```javascript
/**
 * Utility function to sanitize filenames by replacing any characters that are not alphanumeric, dashes, underscores,
 * or periods with an underscore. This ensures the filenames are safe for storage and access within the file system
 * and cloud storage services.
 *
 * @param {string} filename - The original filename to be sanitized.
 * @returns {string} - The sanitized filename.
 */
function sanitizeFilename(filename) {
	// Replace any characters that are not alphanumeric, dashes, underscores, or periods with an underscore
	return filename.replace(/[^a-zA-Z0-9\-_.]/g, "_");
}
```
{% endcode %}

#### Profile Picture Management

**Upload User Profile Picture**

**`POST /upload-user-profile`**

Allows authenticated users to upload a new profile picture. The picture is stored in Google Cloud Storage, and the user's profile is updated with the new picture URL.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for uploading a new profile picture for the user.
 *
 * @route POST /upload-user-profile
 * @param {file} req.file - The new profile picture for the user.
 * @access Private (requires authentication)
 */
app.post(
	"/upload-user-profile",
	upload.single("profilePicture"),
	authenticateToken,
	async (req, res) => {
		const userId = req.user.userId;
		const file = req.file;

		const sanitizedFilename = sanitizeFilename(file.originalname);

		const blob = bucket.file(
			`users/profile-pictures/${userId}/${sanitizedFilename}`
		);
		const blobStream = blob.createWriteStream({
			resumable: true,
		});

		blobStream.on("error", (err) => {
			console.error(err);
			return res.status(500).send("Error uploading to Google Cloud Storage.");
		});

		blobStream.on("finish", async () => {
			const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
			// Update user profile in the database with publicUrl
			await User.update(
				{ profilePicture: publicUrl },
				{ where: { id: userId } }
			);
			res.status(200).json({
				message: "Profile picture uploaded successfully",
				profilePicture: publicUrl,
				redirectUrl: "/home",
			});
		});

		blobStream.end(file.buffer);
	}
);
```
{% endcode %}

**Upload Server Profile Picture**

**`POST /upload-server-profile`**

Authenticated users with appropriate permissions can upload a new profile picture for a server. The picture is stored, and the server's profile is updated accordingly.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for uploading a new profile picture for a server.
 *
 * @route POST /upload-server-profile
 * @param {string} req.body.serverId - The ID of the server for which the profile picture is being uploaded.
 * @param {file} req.file - The new profile picture for the server.
 * @access Private (requires authentication and server ownership)
 */
app.post(
	"/upload-server-profile",
	upload.single("serverProfilePicture"),
	authenticateToken,
	async (req, res) => {
		const serverId = req.body.serverId; // Ensure you have serverId in your request
		const file = req.file;

		const sanitizedFilename = sanitizeFilename(file.originalname);

		const blob = bucket.file(
			`servers/profile-pictures/${serverId}/${sanitizedFilename}`
		);
		const blobStream = blob.createWriteStream({
			resumable: true,
		});

		blobStream.on("error", (err) => {
			console.error(err);
			return res.status(500).send("Error uploading to Google Cloud Storage.");
		});

		blobStream.on("finish", async () => {
			const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
			// Update server profile in the database with publicUrl
			await Server.update(
				{ profilePicture: publicUrl },
				{ where: { id: serverId } }
			);
			res.status(200).json({
				message: "Server profile picture uploaded successfully",
				profilePicture: publicUrl,
			});
		});

		blobStream.end(file.buffer);
	}
);
```
{% endcode %}

#### Username Management

**Change Username**

**`POST /change-username`**

Authenticated users can change their username. This endpoint includes server-side validation for the new username.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for changing the username of the authenticated user.
 *
 * @route POST /change-username
 * @param {string} req.body.newUsername - The new username for the user.
 * @access Private (requires authentication)
 */
app.post(
	"/change-username",
	authenticateToken,
	upload.none(),
	async (req, res) => {
		const { newUsername } = req.body;
		const userId = req.user.userId; // Ensure this is correctly obtained from your authentication token

		// Server-side validation for username length
		if (newUsername.length > 12) {
			return res
				.status(400)
				.json({ error: "Username must be 12 characters or less." });
		}

		try {
			// Check if the new username is already taken by another user
			const existingUser = await User.findOne({
				where: { username: newUsername },
			});
			if (existingUser && existingUser.id !== userId) {
				// If the username is taken and it's not by the current user, return an error
				return res.status(409).json({ error: "Username is already taken." });
			}

			// If the username isn't taken, proceed to update
			const [updatedRows] = await User.update(
				{ username: newUsername },
				{ where: { id: userId } }
			);

			if (updatedRows > 0) {
				res.json({ message: "Username updated successfully." });
			} else {
				// No rows updated, user not found
				res.status(404).json({ error: "User not found or update failed." });
			}
		} catch (err) {
			console.error("Error updating username:", err);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);
```
{% endcode %}

User Account Management

**Delete Account**

**`DELETE /delete-account`**

Allows authenticated users to delete their account, including all owned servers, memberships, and messages. This route requires authentication.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for deleting the authenticated user's account, including owned servers, memberships, and messages.
 *
 * @route DELETE /delete-account
 * @access Private (requires authentication)
 */
app.delete("/delete-account", authenticateToken, async (req, res) => {
	const userId = req.user.userId;

	try {
		// Find all servers owned by the user
		const ownedServers = await Server.findAll({ where: { ownerId: userId } });

		// Extract server IDs for deletion
		const serverIdsToDelete = ownedServers.map((server) => server.id);

		// Delete all ServerUser associations for these servers
		await ServerUser.destroy({ where: { serverId: serverIdsToDelete } });

		// Delete all servers owned by the user
		await Server.destroy({ where: { id: serverIdsToDelete } });

		// Delete all messages sent by the user in any server
		await ServerMessages.destroy({ where: { senderId: userId } });

		// Delete the user's account
		await User.destroy({ where: { id: userId } });

		// Clear the user's session or token to log them out
		res.cookie("token", "", { expires: new Date(0) });

		res.send(
			"Account, owned servers, associated memberships, and messages deleted successfully."
		);
	} catch (err) {
		console.error("Error during account, server, and messages deletion:", err);
		res.status(500).send("Internal server error.");
	}
});
```
{% endcode %}

#### Server Ownership Verification

**Check Server Creator**

**`GET /api/is-creator/:serverId`**

Determines if the authenticated user is the creator of a specified server. It returns a boolean indicating the ownership.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for checking if the authenticated user is the creator of a specified server.
 *
 * @route GET /api/is-creator/:serverId
 * @param {string} req.params.serverId - The ID of the server to check.
 * @access Private (requires authentication)
 */
app.get("/api/is-creator/:serverId", authenticateToken, async (req, res) => {
	const userId = req.user.userId;
	const serverId = req.params.serverId;

	try {
		const server = await Server.findOne({ where: { id: serverId } });
		if (!server) {
			return res.status(404).send("Server not found.");
		}

		const isCreator = server.ownerId === userId;
		res.status(200).json({ isCreator: isCreator });
	} catch (err) {
		console.error("Error checking if user is server creator:", err);
		res.status(500).send("Internal server error.");
	}
});

```
{% endcode %}

#### Server Name Management

**Change Server Name**

**`POST /change-server-name`**

Enables the server owner to change the server's name. This action is restricted to the server's owner and requires authentication.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for changing the name of a server. Only the server owner can change the name.
 *
 * @route POST /change-server-name
 * @param {string} req.body.newServerName - The new name for the server.
 * @param {string} req.body.serverId - The ID of the server whose name is to be changed.
 * @access Private (requires authentication and server ownership)
 */
app.post(
	"/change-server-name",
	authenticateToken,
	upload.none(),
	async (req, res) => {
		// console.log(req.body); // Check what's being received in the request body

		const { newServerName, serverId } = req.body;
		try {
			// Additional validation can be added here (e.g., check newServerName length)

			// Update server name in the database
			const result = await Server.update(
				{ name: newServerName },
				{ where: { id: serverId, ownerId: req.user.userId } } // Ensure the requester is the owner
			);

			if (result[0] > 0) {
				// Check how many rows were affected
				res.json({ message: "Server name updated successfully." });
			} else {
				res
					.status(404)
					.json({ message: "Server not found or you're not the owner." });
			}
		} catch (error) {
			console.error("Failed to change server name:", error);
			res.status(500).json({ message: "Internal server error." });
		}
	}
);
```
{% endcode %}

#### Server Membership Management

**Remove Member**

**`POST /remove-member`**

Allows the server owner to remove a member from the server. This route is protected and requires the requester to be the server's owner.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for removing a member from a server. This can only be done by the server owner.
 *
 * @route POST /remove-member
 * @param {string} req.body.serverId - The ID of the server from which to remove a member.
 * @param {string} req.body.memberToRemove - The ID of the member to remove.
 * @access Private (requires authentication and server ownership)
 */
app.post("/remove-member", authenticateToken, async (req, res) => {
	const { serverId, memberToRemove } = req.body;
	const userId = req.user.userId; // ID of the user making the request

	try {
		const server = await Server.findByPk(serverId, {
			include: ["owner"], // Assuming you have set up an 'owner' association in your model
		});

		if (!server) {
			return res.status(404).json({ message: "Server not found." });
		}

		// console.log(`Server owner ID: ${server.ownerId}`);
		// console.log(`Requesting user ID: ${userId}`);
		// console.log(`Member to remove ID: ${memberToRemove}`);

		// Check if the member being removed is the server owner
		if (parseInt(memberToRemove) === server.ownerId) {
			return res
				.status(403)
				.json({ message: "Cannot remove the server creator." });
		}

		// Remove the member from the server
		const result = await ServerUser.destroy({
			where: {
				serverId: serverId,
				userId: memberToRemove,
			},
		});

		if (result > 0) {
			res.json({ message: "Member removed successfully." });
		} else {
			res
				.status(404)
				.json({ message: "Member not found or not a part of the server." });
		}
	} catch (error) {
		console.error("Error removing member:", error);
		res.status(500).json({ message: "Internal server error." });
	}
});
```
{% endcode %}

**List Server Members**

**`GET /api/server/:serverId/members`**

Fetches the list of members belonging to a specified server. Access is restricted to the server's members.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for fetching the members of a server. Only accessible to members of the server.
 *
 * @route GET /api/server/:serverId/members
 * @param {string} req.params.serverId - The ID of the server whose members are to be listed.
 * @access Private (requires authentication and server membership)
 */
app.get(
	"/api/server/:serverId/members",
	authenticateToken,
	async (req, res) => {
		const { serverId } = req.params;

		try {
			// Find the server and check if the requester is a member
			const server = await Server.findByPk(serverId, {
				include: [
					{
						model: User,
						as: "Users", // Use the alias you defined in your associations
						attributes: ["id", "username"], // Only send necessary attributes
						through: { attributes: [] }, // Do not send join table attributes
					},
				],
			});

			if (!server) {
				return res.status(404).json({ message: "Server not found." });
			}

			// Check if the requester is a member of the server
			const isMember = server.Users.some((user) => user.id === req.user.userId);
			if (!isMember) {
				return res
					.status(403)
					.json({ message: "You are not a member of this server." });
			}

			// Send the member list, excluding the server creator (owner)
			const members = server.Users.filter((user) => user.id !== server.ownerId);
			res.json(members);
		} catch (error) {
			console.error("Error fetching server members:", error);
			res.status(500).json({ message: "Internal server error." });
		}
	}
);
```
{% endcode %}

#### Server Deletion

**Delete Server**

**`DELETE /delete-server/:serverId`**

Enables the server owner to delete the server. This route is protected and requires the requester to be the server's owner.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for deleting a server. This can only be done by the server owner.
 *
 * @route DELETE /delete-server/:serverId
 * @param {string} req.params.serverId - The ID of the server to delete.
 * @access Private (requires authentication and server ownership)
 */
app.delete("/delete-server/:serverId", authenticateToken, async (req, res) => {
	const serverId = req.params.serverId; // Extract serverId from the URL
	const userId = req.user.userId; // ID of the user making the request

	try {
		// Fetch the server to check if the current user is the owner
		const server = await Server.findByPk(serverId);
		if (!server) {
			return res.status(404).json({ message: "Server not found." });
		}

		// Check if the requesting user is the server owner
		if (server.ownerId !== userId) {
			return res
				.status(403)
				.json({ message: "You do not have permission to delete this server." });
		}

		// First, delete any ServerUser entries
		await ServerUser.destroy({
			where: { serverId: serverId },
		});

		// Then, delete the server itself
		await server.destroy();

		res.json({ message: "Server deleted successfully.", redirectUrl: "/home" });
	} catch (error) {
		console.error("Error deleting server:", error);
		res.status(500).json({ message: "Internal server error." });
	}
});
```
{% endcode %}

#### Server Information Retrieval

**Get Server Name**

**`GET /api/server/:serverId/name`**

Retrieves the name of a specified server. This route is protected and requires the requester to be authenticated.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for fetching the name of a server.
 *
 * @route GET /api/server/:serverId/name
 * @param {string} req.params.serverId - The ID of the server whose name is to be fetched.
 * @access Private (requires authentication)
 */
app.get("/api/server/:serverId/name", authenticateToken, async (req, res) => {
	const { serverId } = req.params; // Extract serverId from the URL

	try {
		const server = await Server.findByPk(serverId, {
			attributes: ["name"], // Only fetch the 'name' field
		});

		if (server) {
			// Server found, send back the name
			res.json({ name: server.name });
		} else {
			// Server not found
			res.status(404).json({ message: "Server not found." });
		}
	} catch (error) {
		console.error("Error fetching server name:", error);
		res.status(500).json({ message: "Internal server error." });
	}
});
```
{% endcode %}

#### File Management Utility Functions

**`extractFilePath(fileUrl)`**

Extracts the file path from a given URL, useful for file operations in cloud storage.

{% code lineNumbers="true" %}
```javascript
/**
 * Extracts the file path from a given URL. This is useful for operations that require the path portion of a URL,
 * such as deleting or accessing a specific file in cloud storage.
 *
 * @param {string} fileUrl - The URL from which to extract the file path.
 * @returns {string} - The extracted file path.
 */
function extractFilePath(fileUrl) {
	const url = new URL(fileUrl);
	// Assuming the URL path starts with the bucket name, followed by the actual file path
	// Adjust the substring start index as per your URL format if needed
	return url.pathname.substring(url.pathname.indexOf("/", 1) + 1);
}
```
{% endcode %}

**`deleteFileFromCloud(filepath)`**

Deletes a file from cloud storage based on its path. This function encapsulates the deletion operation and logs the outcome.

{% code lineNumbers="true" %}
```javascript
/**
 * Deletes a file from cloud storage based on the provided file path. This function encapsulates the operation
 * to delete a file and logs the outcome, making it reusable across different parts of the application where
 * file deletion is needed.
 *
 * @param {string} filepath - The path of the file to be deleted from cloud storage.
 * @returns {Promise<void>} - A promise that resolves when the file is successfully deleted or rejects with an error.
 */
async function deleteFileFromCloud(filepath) {
	const decodedFilepath = decodeURIComponent(filepath);
	const file = bucket.file(decodedFilepath);

	try {
		await file.delete();
		console.log(`File ${decodedFilepath} deleted.`);
	} catch (error) {
		console.error(`Failed to delete file ${decodedFilepath}:`, error);
		throw error;
	}
}
```
{% endcode %}

#### File Deletion

**Delete Server File**

**`POST /delete-file`**

Allows members of a server to delete a specific file from the server's storage. It ensures that the user has the necessary permissions and updates the server's file list.

{% code lineNumbers="true" %}
```javascript
/**
 * Route to delete a specific file from a server's storage. Validates that the user belongs to the server
 * and updates the server's file list upon successful deletion.
 *
 * @route POST /delete-file
 * @param {string} req.body.fileUrl - The URL of the file to be deleted.
 * @param {string} req.body.serverId - The ID of the server from which the file is being deleted.
 * @access Private (requires authentication and server membership)
 */
app.post("/delete-file", authenticateToken, async (req, res) => {
	const { fileUrl, serverId } = req.body; // Assuming the client sends the full URL and server ID
	// console.log(fileUrl);
	try {
		const filePath = extractFilePath(fileUrl);
		console.log(`filepath: ${filePath}`);
		await deleteFileFromCloud(filePath);

		// Find the server and update the filePaths array
		const server = await Server.findByPk(serverId);
		if (!server) {
			return res.status(404).json({ message: "Server not found" });
		}

		// Filter out the deleted file's path
		server.filePaths = server.filePaths.filter((path) => path !== fileUrl);

		// Save the updated server
		await server.save();

		res.json({
			message: "File deleted successfully and reference removed from server",
		});
	} catch (error) {
		console.error("Error deleting file and updating server:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

```
{% endcode %}

#### User Session Management

**User Logout**

**`GET /logout`**

Logs out the current user by clearing their authentication token and redirects to the login page.

{% code lineNumbers="true" %}
```javascript
/**
 * Route to log out the current user. Clears the user's authentication token and redirects to the login page.
 *
 * @route GET /logout
 * @access Private (requires authentication)
 */
app.get("/logout", (req, res) => {
	// Clear the cookie named 'token'
	res.cookie("token", "", { expires: new Date(0) });
	res.redirect("/login"); // Redirect user to the login page
});
```
{% endcode %}

#### User Identity Retrieval

**Get Current User ID**

**`GET /api/get-current-user`**

Retrieves the current authenticated user's ID, useful for client-side operations requiring the user's identity.

{% code lineNumbers="true" %}
```javascript
/**
 * Route to retrieve the current authenticated user's ID. Useful for client-side operations that require the user's identity.
 *
 * @route GET /api/get-current-user
 * @access Private (requires authentication)
 */
app.get("/api/get-current-user", authenticateToken, (req, res) => {
	// Assuming `authenticateToken` middleware sets `req.user` to the authenticated user
	if (req.user && req.user.userId) {
		res.json({ currentUserId: req.user.userId });
	} else {
		res.status(401).json({ error: "User not authenticated" });
	}
});

```
{% endcode %}

#### Messaging System

**Fetch Server Messages**

**`GET /messages/:serverId`**

Retrieves all messages for a specified server along with the sender's information. This endpoint is secured, requiring authentication and server membership.

{% code lineNumbers="true" %}
```javascript
/**
 * Route to fetch all messages for a given server. Includes sender information for display.
 *
 * @route GET /messages/:serverId
 * @param {string} req.params.serverId - The ID of the server whose messages are being fetched.
 * @access Private (requires authentication and server membership)
 */
app.get("/messages/:serverId", authenticateToken, async (req, res) => {
	const { serverId } = req.params;

	try {
		const messages = await Message.findAll({
			where: { serverId: serverId },
			include: [
				{
					model: User,
					as: "sender",
					attributes: ["username", "profilePicture"],
				},
			],
			order: [["createdAt", "ASC"]], // Order by creation time
		});

		res.json(messages);
	} catch (error) {
		console.error("Error fetching messages:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
```
{% endcode %}

#### File Upload System

**Upload Image File**

**`POST /upload-image`**

Validates and uploads an image file, ensuring the file is an image and within the size limit. This endpoint requires user authentication.

{% code lineNumbers="true" %}
```javascript
/**
 * Route to upload an image file. Validates that the file is an image and within size limits before uploading.
 *
 * @route POST /upload-image
 * @param {file} req.file - The image file to be uploaded.
 * @access Private (requires authentication)
 */
app.post(
	"/upload-image",
	upload.single("image"),
	authenticateToken,
	async (req, res) => {
		try {
			const userId = req.user.userId; // Assuming you have a way to identify the user

			// Validate the file is an image
			if (!req.file.mimetype.startsWith("image/")) {
				return res
					.status(400)
					.json({ message: "Please upload an image file." });
			}

			// Check the size of the uploaded image
			if (req.file.size > 10 * 1024 * 1024) {
				// 10 MB limit
				return res
					.status(400)
					.json({ message: "Image cannot be larger than 10 MB." });
			}

			// Create a new blob in the bucket and upload the file data
			const blob = bucket.file(
				`images/${userId}/${Date.now()}-${req.file.originalname}`
			);
			const blobStream = blob.createWriteStream({
				resumable: true,
				metadata: {
					contentType: req.file.mimetype,
				},
			});

			blobStream.on("error", (err) => {
				console.error(err);
				return res.status(500).send("Error uploading to Google Cloud Storage.");
			});

			blobStream.on("finish", async () => {
				// Make the file public and get its public URL
				const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
				// console.log(publicUrl);
				// Send the public URL as a response
				res.status(200).json({
					message: "Image uploaded successfully",
					imageUrl: publicUrl,
				});
			});

			blobStream.end(req.file.buffer);
		} catch (err) {
			console.error("Error uploading image:", err);
			res.status(500).send("Internal server error");
		}
	}
);
```
{% endcode %}

#### Server Membership System

**Join Server with Invite Code**

**`GET /joinserver/:inviteCode`**

Allows a user to join a server using an invite code, ensuring the user is not already a member. This endpoint requires authentication.

{% code lineNumbers="true" %}
```javascript
/**
 * Route to allow a user to join a server using an invite code. Validates the invite code and adds the user to the server.
 *
 * @route GET /joinserver/:inviteCode
 * @param {string} req.params.inviteCode - The invite code for the server.
 * @access Private (requires authentication)
 */
app.get("/joinserver/:inviteCode", authenticateToken, async (req, res) => {
	const { inviteCode } = req.params;

	try {
		// Find the server by its unique code
		const server = await Server.findOne({ where: { serverCode: inviteCode } });

		if (!server) {
			return res.status(404).send("Server not found.");
		}

		// Retrieve the ServerUser model which is the join table between Server and User
		const ServerUser = db.ServerUser;

		// Check if the user is already a member of the server to prevent duplicate entries
		const existingMember = await ServerUser.findOne({
			where: {
				serverId: server.id,
				userId: req.user.userId,
			},
		});

		if (existingMember) {
			return res.status(409).send("User is already a member of this server.");
		}

		// Add the current user to the server if not already a member
		await ServerUser.create({
			serverId: server.id,
			userId: req.user.userId,
		});

		// Redirect the user to the server's page or home page after joining
		res.redirect("/home");
	} catch (err) {
		console.error("Error joining server:", err);
		res.status(500).send("Internal server error.");
	}
});

```
{% endcode %}

**Leave Server or Delete Server**

**`POST /leave-server/:serverId`**

Permits an authenticated user to leave a server. If the user is the owner, the entire server and associated data are deleted.

{% code lineNumbers="true" %}
```javascript
/**
 * Route for an authenticated user to leave a server. If the user is the owner of the server, the entire server is deleted.
 * The server ID is obtained from the route parameter, and the user ID is expected to be sent in the request body.
 *
 * @route POST /leave-server/:serverId
 * @param {string} req.params.serverId - The ID of the server the user wishes to leave.
 * @param {number} req.body.userId - The ID of the user leaving the server, should match the authenticated user.
 * @access Private (requires authentication)
 */
app.post("/leave-server/:serverId", authenticateToken, async (req, res) => {
	const serverId = req.params.serverId; // The ID of the server to leave, obtained from the URL
	const userId = req.body.userId; // The ID of the user leaving the server, obtained from the request body

	try {
		// Ensure the user making the request is the same as the userId provided in the body
		if (req.user.userId !== userId) {
			return res.status(403).json({ message: "Unauthorized action." });
		}

		// Find the server to determine if the user is the owner
		const server = await Server.findByPk(serverId);
		if (!server) {
			return res.status(404).json({ message: "Server not found." });
		}

		if (server.ownerId === userId) {
			// If the user is the server owner, first remove all ServerUser relationships
			await ServerUser.destroy({ where: { serverId: serverId } });

			// Then delete the entire server
			await Server.destroy({ where: { id: serverId } });

			res.json({
				message: "Server deleted successfully as you were the owner.",
				redirectUrl: "/home", // Include the redirect URL in the response
			});
		} else {
			// If the user is not the owner, remove their membership from the server
			await ServerUser.destroy({
				where: {
					serverId: serverId,
					userId: userId,
				},
			});
			res.json({
				message: "You have successfully left the server.",
				redirectUrl: "/home", // Include the redirect URL in the response
			});
		}
	} catch (error) {
		console.error("Error leaving server:", error);
		res.status(500).json({ message: "Internal server error." });
	}
});
```
{% endcode %}

#### WebSockets with Socket.IO

**WebSocket Connection and Authentication**

Establishes WebSocket connections with clients, handling authentication, room joining, message sending, and typing indicator broadcasting.

```javascript
io.on("connection", (socket) => {
    // WebSocket event handling logic...
});
```

#### Utility Functions

**Authenticate Socket Token**

Verifies the JWT token for WebSocket connections, ensuring that only authenticated users can establish a socket connection.

{% code lineNumbers="true" %}
```javascript
/**
 * Authenticates the socket connection using a JWT token.
 * @param {string} token - The JWT token to authenticate.
 * @returns {Promise} - A promise that resolves with the decoded token if authentication succeeds, or rejects with an error if it fails.
 */
function authenticateSocketToken(token) {
	return new Promise((resolve, reject) => {
		if (!token) {
			return reject(new Error("Access denied. No token provided."));
		}

		jwt.verify(token, SECRET_KEY, (err, decoded) => {
			if (err) {
				console.error("Token verification failed:", err);
				if (err instanceof jwt.JsonWebTokenError) {
					// Invalid signature or malformed token
					reject(new Error("Invalid token."));
				} else if (err instanceof jwt.NotBeforeError) {
					// Token used before its nbf claim
					reject(new Error("Token used before its valid date."));
				} else if (err instanceof jwt.TokenExpiredError) {
					// Token expired
					reject(new Error("Token expired."));
				} else {
					// Other errors
					reject(new Error("An error occurred while verifying the token."));
				}
			} else {
				resolve(decoded); // Successfully decoded token
			}
		});
	});
}
```
{% endcode %}

**Parse Cookies**

Parses the cookie string from WebSocket headers into an object of key-value pairs, facilitating the extraction of authentication tokens.

{% code lineNumbers="true" %}
```javascript
/**
 * Parses a cookie string into an object with key-value pairs.
 * @param {string} cookieString - The string containing the cookie data.
 * @returns {Object} - An object where each key is a cookie name and each value is the corresponding cookie value.
 */
function parseCookies(cookieString) {
	const list = {};
	cookieString?.split(";").forEach((cookie) => {
		const parts = cookie.split("=");
		const key = parts.shift().trim();
		const value = parts.join("=");
		list[key] = decodeURIComponent(value);
	});
	return list;
}

```
{% endcode %}

**Retrieve User Data**

Fetches user data based on user ID, providing essential information such as username and profile picture for messaging and user identification purposes.

{% code lineNumbers="true" %}
```javascript
/**
 * Retrieves user data by user ID.
 * @param {number} userId - The ID of the user to retrieve data for.
 * @returns {Promise<Object>} - A promise that resolves with the user data, or rejects with an error if the user cannot be found.
 */
async function getUserDataById(userId) {
	try {
		const user = await User.findByPk(userId, {
			attributes: ["username", "profilePicture"],
		});

		if (!user) {
			return null; // or throw new Error('User not found');
		}

		return {
			username: user.username,
			profilePicture: user.profilePicture,
		};
	} catch (error) {
		console.error("Error fetching user:", error);
		throw error;
	}
}
```
{% endcode %}

**Retrieve Server Data**

Fetches server data by server ID, offering details like server name and profile picture necessary for messaging contexts and server management.

{% code lineNumbers="true" %}
```javascript
/**
 * Retrieves server data by server ID.
 * @param {number} serverId - The ID of the server to retrieve data for.
 * @returns {Promise<Object>} - A promise that resolves with the server data, or rejects with an error if the server cannot be found.
 */
async function getServerDataById(serverId) {
	try {
		// Assuming 'Server' is your Sequelize model for the server table
		const server = await Server.findByPk(serverId, {
			attributes: ["id", "name", "profilePicture"], // Include only the attributes you need
		});

		if (!server) {
			return null; // or throw new Error('Server not found');
		}

		return {
			id: server.id,
			name: server.name,
			profilePicture: server.profilePicture, // Assuming this is the field for the server's profile picture
		};
	} catch (error) {
		console.error("Error fetching server:", error);
		throw error;
	}
}
```
{% endcode %}
