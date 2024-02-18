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
