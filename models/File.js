const mongoose = require("mongoose");

// File model
const fileSchema = new mongoose.Schema({
	filename: String,
	size: Number,
	type: String,
	uploadDate: Date,
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server" },
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
