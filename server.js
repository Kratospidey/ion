require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cookieParser = require("cookie-parser"); // Import cookie-parser
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const fs = require("fs");
const path = require("path");

const MONGODB_URL = process.env.MONGODB_URL;

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

const { User, File, ChatRoom, Server } = require("./models"); // Import your models
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

// Connect to MongoDB
mongoose
	.connect(MONGODB_URL)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Could not connect to MongoDB", err));

// Route to handle user login
app.post("/login", async (req, res) => {
	try {
		// Validate email format
		const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		if (!emailPattern.test(req.body.email)) {
			return res.status(400).send("Invalid email format");
		}

		// Check if the email exists in the database
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			return res.status(401).send("Email not found");
		}

		// Compare the provided password with the stored hashed password
		const isMatch = await user.comparePassword(req.body.password);
		if (!isMatch) {
			return res.status(401).send("Invalid email or password");
		}

		// If the email and password are valid, generate a JWT and send it back to the client
		const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
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
		// Fetch servers the user is part of
		const servers = await Server.find({
			userIds: { $in: [req.user.userId] },
		}).exec();

		// Render the layout view with the data and a flag indicating no members section
		res.render("layout", { servers: servers, showMembers: false });
	} catch (err) {
		console.error("Error fetching servers:", err);
		res.status(500).send("Internal server error");
	}
});

// server.js
app.get("/server/:serverId", authenticateToken, async (req, res) => {
	try {
		// Find the server by its ID
		const server = await Server.findById(req.params.serverId).exec();

		// If the server exists and the user is part of it, fetch the members
		if (server && server.userIds.includes(req.user.userId)) {
			const members = await User.find({ _id: { $in: server.userIds } })
				.select("username")
				.exec();
			// Fetch all servers the user is part of again since it wasn't passed before
			const servers = await Server.find({
				userIds: { $in: [req.user.userId] },
			}).exec();
			// Render the layout view with the data and a flag indicating the members section
			res.render("layout", {
				servers: servers,
				members: members,
				showMembers: true,
				currentServer: server, // Pass the current server data
			});
		} else {
			res.status(404).send("Server not found or user is not a member.");
		}
	} catch (err) {
		console.error("Error fetching server members:", err);
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
			// Find the server by its ID
			const server = await Server.findById(req.body.serverId).exec();
			const serverId = req.body.serverId;

			// If the server exists and the user is part of it, add the file path to the server
			if (server && server.userIds.includes(req.user.userId)) {
				// Add the file path to the server's filePaths array
				// Inside your POST /upload route handler
				server.filePaths.push(`/uploads/${serverId}/${req.file.filename}`); // Store the server-specific path
				await server.save();

				// Send a response to the client
				res.json({
					message: "File uploaded successfully",
					filePath: "/uploads/" + req.file.filename, // Send only the relative path
				});
			} else {
				res.status(404).send("Server not found or user is not a member.");
			}
		} catch (err) {
			console.error("Error uploading file:", err);
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

// Protected route example
app.get("/protected", authenticateToken, (req, res) => {
	res.send("This is a protected route.");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
