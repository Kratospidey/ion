// models/Server.js
const { nanoid } = require("nanoid");

/**
 * Defines the Server model using Sequelize, representing chat servers within the application. Each server has a
 * name, a profile picture, an optional JSON field for file paths related to the server, and a unique server code
 * generated using the `nanoid` library. The `ownerId` field establishes ownership of a server by a user.
 *
 * Associations include a many-to-many relationship with the User model through the ServerUser join table, allowing
 * users to be part of multiple servers. Additionally, a one-to-many relationship exists between users and servers,
 * indicating that a user can own multiple servers but each server has only one owner.
 *
 * The model extends with a method `addUser`, which adds a user to the server if they are not already a member,
 * leveraging the ServerUser model. This method provides an interface to manage server memberships.
 *
 * @module Server
 * @param {object} sequelize - Sequelize instance.
 * @param {object} DataTypes - Sequelize data types.
 * @returns {object} The Sequelize model for Server.
 * 
 * @example
 * // Defining the Server model in your Sequelize setup
 * const Server = sequelize.define('Server', {
 *   name: DataTypes.STRING,
 *   // other fields...
 * });
 *
 * @example
 * // Using the addUser method to add a user to a server
 * Server.findOne({ where: { name: 'Gaming Lounge' } })
 *   .then(server => server.addUser(1)) // Assuming '1' is the userId
 *   .then(serverUser => console.log(`Added user to server: ${serverUser}`))
 *   .catch(error => console.error(error));
 */
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
		ownerId: {
			// Add this field to represent the server owner
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Users", // This is a reference to another model
				key: "id", // This is the column name of the referenced model
			},
		},
	});

	Server.associate = function (models) {
		Server.belongsToMany(models.User, {
			through: models.ServerUser,
			foreignKey: "serverId",
		});
		Server.belongsTo(models.User, {
			// Add this association to represent the owner
			foreignKey: "ownerId",
			as: "owner",
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
