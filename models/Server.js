// models/Server.js
const { nanoid } = require("nanoid");

module.exports = (sequelize, DataTypes) => {
	const Server = sequelize.define("Server", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		profilePicture: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		filePaths: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		serverCode: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			defaultValue: () => nanoid(6), // Synchronously generate the code
		},
	});

	Server.associate = function (models) {
		Server.belongsToMany(models.User, {
			through: models.ServerUser,
			foreignKey: "serverId",
		});
	};

	Server.prototype.addUser = async function (userId) {
		console.log(`user id ${userId}`);
		const ServerUser = sequelize.model("ServerUser");
		try {
			// Check if the user is already added to the server
			const [serverUser, created] = await ServerUser.findOrCreate({
				where: { serverId: this.id, userId: userId },
			});

			if (!created) {
				console.log(`User ${userId} is already a member of server ${this.id}.`);
			}

			return serverUser;
		} catch (err) {
			throw new Error(
				`Failed to add user ${userId} to server ${this.id}: ${err.message}`
			);
		}
	};

	return Server;
};
