// models/Message.js

/**
 * Defines the Message model using Sequelize, representing messages sent within the application. Each message has
 * a content field of type TEXT to accommodate potentially long messages. Sequelize automatically adds createdAt and
 * updatedAt timestamp fields to track when each message was created and last updated.
 *
 * Associations are established with the User and Server models to track the sender of each message and the server
 * where the message was sent, respectively. These associations add userId and serverId fields to the Message model,
 * creating foreign key relationships that link messages to their senders and respective servers.
 *
 * @module Message
 * @param {object} sequelize - Sequelize instance.
 * @param {object} DataTypes - Sequelize data types.
 * @returns {object} The Sequelize model for Message.
 * 
 * @example
 * // Creating a new message in a server by a user
 * Message.create({
 *   content: 'Hello, world!',
 *   userId: 1, // Assuming '1' is the ID of the sender
 *   serverId: 2, // Assuming '2' is the ID of the server where the message is sent
 * });
 */
module.exports = (sequelize, DataTypes) => {
	const Message = sequelize.define("Message", {
		content: {
			type: DataTypes.TEXT, // Use TEXT data type for potentially long messages
			allowNull: false,
		},
		// Timestamps can be automatically added by Sequelize
		// createdAt and updatedAt fields will be automatically created
	});

	Message.associate = function (models) {
		// Associate the Message with the User model to know who sent the message
		Message.belongsTo(models.User, {
			foreignKey: "userId", // Adds a userId field to Message to store the sender's User ID
			as: "sender",
		});

		// Associate the Message with the Server model to know where the message was sent
		Message.belongsTo(models.Server, {
			foreignKey: "serverId", // Adds a serverId field to Message to store the Server ID where the message was sent
			as: "server",
		});
	};

	return Message;
};
