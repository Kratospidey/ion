// start working azure

require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cookieParser = require("cookie-parser"); // Import cookie-parser
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const db = require("./models/index"); // Adjust the path according to your project structure
const { Server, User, ServerUser, Message } = require("./models"); // Adjust the path to your models directory

const EmojiConvertor = require("emoji-js");
const emoji = new EmojiConvertor();

// Set the mode to replace shortcodes with actual emojis
emoji.replace_mode = "unified";
emoji.allow_native = true; // Use native Unicode emojis where available

// gdrive conf
const { Storage } = require("@google-cloud/storage");
const multer = require("multer");

// Set up multer to store files in memory
const upload = multer({
	storage: multer.memoryStorage(),
});

const fs = require("fs");
const path = require("path");

// Use the environment variable for the bucket name
const googleCredentials = {
	type: "service_account",
	project_id: "techproject-ion",
	private_key_id: "4bab25a736c79e915bae8810575cb1ff56b61444",
	private_key:
		"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5we6XVMqlASFN\ndO64lVaMZKTZN/lZXWIU6C04yWNZpsa8Xuvyv7yt3slkpo4S/X/E9eTOXk7nXfNY\niK/yMbeINUdqerGew6osgMy/wbJRpZeamEKj0X//YrM+3Dmr6czKe2/7vE4HfQ6y\n/iSrLph9hgCHE9yBC1nfXMrONtLROpReZnw5iekwp4jH/rAFXLsiBexivbh1EzPe\nmgPS9PPQck9ex3jDU6tLQk+60uuQF62NYrby2567BpRuQTg8PrkGbMOQ7suFvj2D\nuqo18msaRO0DqoLtRkW0XIMvWkBOgWQtTKNgC6BBE+PUNwRbjT9Yzxk04BX01U5q\nXD41KdPhAgMBAAECggEAM3Mrim7J0foGJ1YD6Mw0NJ6Lqj5+qenbiL7mB5yAEAzJ\nbtM7tvi0YdQbI+2d3FSqVvtkbGRipmK3TAZP9V0f4HIhXbSuDbNUJw9lppcXtNWQ\nsBkMHCOiuDG2Q+rrblpLhqm50pfNZPWWZK1Pqro1Mk8zRjaSFIv4UI16/rLgoWKH\nbB+RQ1I8lOE1++EvW/SNBaiXzhONz6gdVrzVsLuRCPilC+iI5UHN1OmQsKaK0Dh0\n6KAN6qBDup+XftuFcWBy7EoAqKOm6AsUE4y3wo4RVkpstApzs7zywZlMA5pTsmvK\n+7NbTO03iq4OQcdU95Av4uw93c+WKTxkgwm24x4ToQKBgQDgbHu/DJBqqffs/clr\nEMPvtsrnCIobGxSaCgN3+hpR9VAbDUjs1juwKIFAEdIN6vWA6+rku64Sohh7ViHo\nsZt11HjGJ9sRxDBmWEIqkWcFQ1LwfELlX1jfBnolKsW7ugeH0rMzC56UijVbf88l\n6F4BOphXDNVMrhfb6+Rlul6wJwKBgQDT5LsNA9tfD3YHA8K0zi5jBkko6TdlWFTX\ncva5PK+72sV9ekIeENI2KU52+gXIAAY79a2oxVz0++MfxdSPVNmVYLS88zoXr+zk\n10rB/n8oZr5++e8fN0S/t/s48TKYe6lljmjTRfogecCCA4tQTlS1VImPlPRHLW5j\nfw6qYP/YtwKBgQDO9nxwRY/xLen73lefqwhmyrX3tcJXGPQ40j88p6MaLha/u9Ki\nxzaoT9JSWZzTRPk++VHXutTfTikxpM8EnrX1RgpTA3JdwgW4fHAYfZr6GYolSRMQ\nIIv+sSR3nihX5UkIkuC7lF2cMpDeXtGT7eSzUWwn6yfR3UMXh0VMI0ErRQKBgQCr\nGNvtU3r01HAyk9fJ1V7hePbkQQUJIX1Ihz0wMA+aubmUa38t9dk4ALyqF5NJfrOK\nAQRb7hn0e9xXEJBluFcFZpQqqp/y9oxr8GgeI1kcD3Ks5zYt15v8zxvdS+3V8KzF\nI2wDhVLGnGlU0nXQv59o2D1HojhprQag8ryt2SteGwKBgDDL0O1xhj7JnBalvYO7\nDi8XrVeppo2/92VqR107Gk6eQ0PEnsBi3FBaD30AfFsWqoWx9cJIwihjuHiIrpSB\njaLRY85/sOZAJs0pnQXD8PbSQCvQ96EI24Y6TDwCoQdEjPWIo4nWZd2tqKFmgPdt\nPvuLihesLfLnd7WBms1y+vZi\n-----END PRIVATE KEY-----\n",
	client_email: "tp-ion@techproject-ion.iam.gserviceaccount.com",
	client_id: "112627571073295599138",
	auth_uri: "https://accounts.google.com/o/oauth2/auth",
	token_uri: "https://oauth2.googleapis.com/token",
	auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
	client_x509_cert_url:
		"https://www.googleapis.com/robot/v1/metadata/x509/tp-ion%40techproject-ion.iam.gserviceaccount.com",
	universe_domain: "googleapis.com",
};

const googleStorage = new Storage({ credentials: googleCredentials });
const bucketName = process.env.GCS_BUCKET_NAME; // Ensure you have this variable in your .env file
const bucket = googleStorage.bucket(bucketName);

const sequelize = db.sequelize;

sequelize
	.authenticate()
	.then(() => console.log("Connected to the database"))
	.catch((err) => console.error("Unable to connect to the database", err));

// const upload = multer({ storage: storage });

const bcrypt = require("bcrypt"); // For hashing passwords

const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

const http = require("http");
const socketIO = require("socket.io"); // Make sure to require the 'socket.io' library
const server = http.createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000", // Adjust according to your setup
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Middleware
app.use(cors());
app.use(cookieParser()); // Use cookie-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files after defining routes
app.use(express.static("public")); // Serve static files from the 'public' directory
app.use("/img", express.static("img"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set the views directory

app.use((req, res, next) => {
	// Check if the request is coming from localhost
	const isLocalhost =
		req.hostname === "localhost" || req.hostname === "127.0.0.1";

	if (
		!isLocalhost &&
		req.header("x-forwarded-proto") !== "https" &&
		process.env.NODE_ENV === "production"
	) {
		res.redirect(`https://${req.header("host")}${req.url}`);
	} else {
		next();
	}
});

// Secret key for signing JWTs
const SECRET_KEY = process.env.JWT_SECRET; // Get the secret key from environment variables

// Define routes
app.get("/", (req, res) => {
	// Redirect to the login page
	res.redirect(302, "/login");
});

app.get("/login", (req, res) => {
	// Check if the user's request contains a token cookie
	const token = req.cookies.token;

	if (token) {
		try {
			// Verify the token using the same secret key used to sign the JWT
			const decoded = jwt.verify(token, SECRET_KEY);

			// If the token is valid, redirect to /home
			return res.redirect("/home");
		} catch (err) {
			// If the token is not valid, catch the error (it might be expired or invalid)
			console.error("Error verifying token:", err);
		}
	}

	// If there's no token or it's invalid, render the login page
	res.render("login");
});

// Route to handle user login
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
			expiresIn: "1d",
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

// server.js
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

// server.js
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

// server.js
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

// Middleware to verify JWT
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

// Render the sign-up page
app.get("/signup", (req, res) => {
	res.render("signup");
});

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

// Render the onboarding page
app.get("/onboarding", authenticateToken, (req, res) => {
	res.render("onboarding");
});

// Handle creating a new server with mandatory server profile picture
app.post(
	"/create-server",
	[authenticateToken, upload.single("serverProfilePicture")], // Use 'upload' middleware for single file upload
	async (req, res) => {
		try {
			const { serverName } = req.body;
			const userId = req.user.userId;

			// Check if server profile picture is uploaded
			if (!req.file) {
				return res.status(400).send("Server profile picture is required.");
			}

			// Upload the server profile picture to Google Cloud Storage
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

// Handle joining an existing server
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

function sanitizeFilename(filename) {
	// Replace any characters that are not alphanumeric, dashes, underscores, or periods with an underscore
	return filename.replace(/[^a-zA-Z0-9\-_.]/g, "_");
}

// User Profile Picture Upload
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

// Server Profile Picture Upload
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

// Assuming you have express router setup
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

// Server-Side: Get all members of a server
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

// Function to extract file path from URL
function extractFilePath(fileUrl) {
	const url = new URL(fileUrl);
	// Assuming the URL path starts with the bucket name, followed by the actual file path
	// Adjust the substring start index as per your URL format if needed
	return url.pathname.substring(url.pathname.indexOf("/", 1) + 1);
}

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

// Express route handler
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

app.get("/logout", (req, res) => {
	// Clear the cookie named 'token'
	res.cookie("token", "", { expires: new Date(0) });
	res.redirect("/login"); // Redirect user to the login page
});

app.get("/api/get-current-user", authenticateToken, (req, res) => {
	// Assuming `authenticateToken` middleware sets `req.user` to the authenticated user
	if (req.user && req.user.userId) {
		res.json({ currentUserId: req.user.userId });
	} else {
		res.status(401).json({ error: "User not authenticated" });
	}
});

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

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

io.on("connection", (socket) => {
	const cookieString = socket.request.headers.cookie;
	const cookies = parseCookies(cookieString); // You'll need a function to parse the cookie string
	// console.log(cookies);
	const token = cookies.token; // Replace 'token' with the name of your cookie
	// console.log("Headers:", socket.request.headers);

	// Verify the token. The implementation depends on your authentication system
	authenticateSocketToken(token)
		.then((decoded) => {
			// console.log("Authenticated user:", decoded.userId);
			socket.emit("userId", { userId: decoded.userId });
			// console.log(`server side id: ${decoded.userId}`);
			// Server-side
			socket.on("joinRoom", (roomId) => {
				socket.join(roomId);
			});

			socket.on("sendMessage", async (data) => {
				const { message, roomId } = data;
				const userId = decoded.userId; // Assuming this is obtained from token authentication

				try {
					const newMessage = await Message.create({
						content: message,
						userId: userId, // Assuming 'userId' is available from the authenticated user
						serverId: roomId, // Assuming 'roomId' corresponds to 'serverId'
					});

					// Fetch additional user data if needed
					const userData = await getUserDataById(userId);

					const chatMessage = {
						userId,
						message: newMessage.content,
						username: userData.username,
						profilePicture: userData.profilePicture,
						timestamp: new Date().toISOString(), // Alternatively, use Sequelize's `createdAt`
					};

					// Emit the message to the specific room, including the sender's user data
					io.to(roomId).emit("chatMessage", chatMessage);
				} catch (error) {
					console.error("Error saving message:", error);
					// Handle error appropriately
				}
			});
			socket.on("typing", async (data) => {
				const { roomId, typing } = data;

				// Broadcast the typing event to all other users in the room
				const userData = await getUserDataById(decoded.userId);
				username = userData.username;
				socket.to(roomId).emit("typing", { username: username, typing });
			});
			socket.on("sendImage", async (data) => {
				const { imageUrl, roomId } = data;
				const userId = decoded.userId; // Assuming this is obtained from token authentication

				try {
					// Fetch user details from the database
					const userData = await getUserDataById(userId); // Replace getUserDataById with your actual function to fetch user details

					// Save the image message in the database
					const newMessage = await Message.create({
						content: imageUrl, // Storing the image URL as the message content
						userId: userId,
						serverId: roomId, // Assuming 'roomId' corresponds to 'serverId' or similar in your schema
					});
					// console.log(newMessage.content);
					// Construct the image message object including user details and database record info
					const imageMessage = {
						userId,
						message: newMessage.content, // The image URL from the saved message
						username: userData.username,
						profilePicture: userData.profilePicture,
						timestamp: newMessage.createdAt, // Use the createdAt timestamp from the saved message
					};
					// console.log(imageMessage.message);

					// Broadcast the image message to all clients in the room, including sender's user details
					io.to(roomId).emit("sendImage", imageMessage);
				} catch (error) {
					console.error("Error handling sendImage event:", error);
					// Handle the error appropriately
				}
			});
		})
		.catch((error) => {
			console.log("Authentication error:", error.message);
			socket.disconnect(true); // Disconnect if authentication fails
		});
});

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
