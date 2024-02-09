const mongoose = require("mongoose");

// Define the Server schema
const serverSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	profilePicture: {
		type: String,
		required: true,
	},
	userIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	filePaths: [String],
});

// Create the Server model
const Server = mongoose.model("Server", serverSchema);

module.exports = Server;
