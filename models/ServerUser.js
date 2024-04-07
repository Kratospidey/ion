// models/ServerUser.js

/**
 * Defines the ServerUser join model using Sequelize, which facilitates the many-to-many relationship between
 * the User and Server models. This model acts as a through table in the association, containing rows that link
 * users to servers. Each row has an auto-incrementing primary key ID. The model also enforces a unique constraint
 * on the combination of `serverId` and `userId` to prevent duplicate associations.
 *
 * The associations defined within this model specify that a ServerUser entry belongs to both a User and a Server.
 * The `onDelete: "CASCADE"` option ensures that when a User or Server is deleted, their associated ServerUser
 * entries are also removed, maintaining referential integrity.
 *
 * @module ServerUser
 * @param {object} sequelize - Sequelize instance.
 * @param {object} DataTypes - Sequelize data types.
 * @returns {object} The Sequelize join model for ServerUser.
 * 
 * @example
 * // Associating a user with a server in your Sequelize setup
 * ServerUser.create({
 *   userId: 1, // Assuming '1' is the userId
 *   serverId: 2, // Assuming '2' is the serverId
 * });
 */
module.exports = (sequelize, DataTypes) => {
	const ServerUser = sequelize.define(
		"ServerUser",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			// other fields can remain as they are
		},
		{
			tableName: "server_users",
			timestamps: false,
			indexes: [
				{
					unique: true,
					fields: ["serverId", "userId"],
				},
			],
		}
	);

	ServerUser.associate = function (models) {
		ServerUser.belongsTo(models.User, {
			foreignKey: "userId",
			as: "User",
			onDelete: "CASCADE", // or another action that fits your use case
		});
		ServerUser.belongsTo(models.Server, {
			foreignKey: "serverId",
			as: "Server",
			onDelete: "CASCADE", // or another action that fits your use case
		});
	};

	return ServerUser;
};
