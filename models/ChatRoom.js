const mongoose = require("mongoose");

// Chat Room model
const chatRoomSchema = new mongoose.Schema({
	serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server" },
	messages: [
		{
			messageId: mongoose.Schema.Types.ObjectId,
			userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
			text: String,
			timestamp: Date,
		},
	],
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

module.exports = ChatRoom;