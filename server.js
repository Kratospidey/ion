require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cookieParser = require("cookie-parser"); // Import cookie-parser
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const db = require("./models/index"); // Adjust the path according to your project structure
const { User, Server, ServerUser } = db;

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: "mysql", // or 'sqlite', 'postgres', 'mssql'
		// ... other options
	}
);

sequelize
	.authenticate()
	.then(() => console.log("Connected to the database"))
	.catch((err) => console.error("Unable to connect to the database", err));

const fs = require("fs");
const path = require("path");

// server.js
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Extract the server ID from the request body
		const serverId = req.body.serverId;
		// Create a subdirectory for the server
		const serverDirectory = path.join(__dirname, "public/uploads", serverId);
		// Ensure the directory exists
		fs.mkdirSync(serverDirectory, { recursive: true });
		cb(null, serverDirectory);
	},
	filename: function (req, file, cb) {
		// Generate a unique filename based on the current timestamp and the original file name
		const fileName = `${file.originalname}`;
		cb(null, fileName);
	},
});

const upload = multer({ storage: storage });

const bcrypt = require("bcrypt"); // For hashing passwords

const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

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

// Define routes
app.get("/", (req, res) => {
	// Redirect to the login page
	res.redirect(302, "/login");
});

app.get("/login", (req, res) => {
	// Render the login page
	res.render("login");
});

// Secret key for signing JWTs
const SECRET_KEY = process.env.JWT_SECRET; // Get the secret key from environment variables

// Route to handle user login
app.post("/login", async (req, res) => {
	try {
		// Validate email format
		const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		if (!emailPattern.test(req.body.email)) {
			return res.status(400).send("Invalid email format");
		}

		// Check if the email exists in the database
		const user = await User.findOne({ where: { email: req.body.email } });
		if (!user) {
			return res.status(401).send("Email not found");
		}

		// Compare the provided password with the stored hashed password
		const isMatch = await user.comparePassword(req.body.password);
		if (!isMatch) {
			return res.status(401).send("Invalid email or password");
		}

		// If the email and password are valid, generate a JWT and send it back to the client
		const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
			expiresIn: "1d",
		});
		res.cookie("token", token, { httpOnly: true });
		res.status(200).send("Logged in");
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
					as: "Servers", // Adjust based on your association alias
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

		const servers = user ? user.Servers : [];

		res.render("layout", { servers: servers, showMembers: false });
	} catch (err) {
		console.error("Error fetching servers:", err);
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
		server.filePaths = await validateFilePaths(
			server.filePaths || [],
			server.id
		);

		res.render("layout", {
			servers: userServers ? userServers.Servers : [],
			members: server.Users,
			showMembers: true,
			currentServer: server,
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

			// Find the server to update filePaths
			const server = await Server.findByPk(serverId);
			if (!server) {
				return res.status(404).send("Server not found.");
			}

			// Update the server's filePaths array
			// Sequelize doesn't support array_append, so you need to handle array updates manually
			const updatedFilePaths = server.filePaths
				? [...server.filePaths, `/uploads/${serverId}/${req.file.filename}`]
				: [`/uploads/${serverId}/${req.file.filename}`];
			await server.update({ filePaths: updatedFilePaths });

			// Send a response to the client
			res.json({
				message: "File uploaded successfully",
				filePath: `/uploads/${serverId}/${req.file.filename}`, // Send only the relative path
			});
		} catch (err) {
			console.error("Error uploading file:", err.message, err.stack);
			res.status(500).send("Internal server error");
		}
	}
);

// server.js
app.get("/server/:serverId/files/:filename", (req, res) => {
	const serverId = req.params.serverId;
	const filename = req.params.filename;
	res.sendFile(path.join(__dirname, "public/uploads", serverId, filename));
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
	const token = req.cookies.token;
	if (!token) {
		return res.status(401).send("Access denied. No token provided.");
	}

	try {
		const decoded = jwt.verify(token, SECRET_KEY);
		req.user = decoded;
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

const validateFilePaths = async (filePaths, serverId) => {
	const validFilePaths = [];

	for (const filePath of filePaths) {
		const fullPath = path.join(
			__dirname,
			"public/uploads",
			serverId.toString(),
			filePath.split("/").pop()
		);

		if (fs.existsSync(fullPath)) {
			// Synchronously checks for the existence of a file
			validFilePaths.push(filePath);
		}
	}

	return validFilePaths;
};


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
