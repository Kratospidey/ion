// models/ServerUser.js
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
