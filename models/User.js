// models/User.js
const bcrypt = require("bcrypt"); // For hashing passwords

module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define("User", {
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: {
				msg: "The username is already taken.",
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		profilePicture: DataTypes.STRING,
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		lastLogin: DataTypes.DATE,
	});

	User.associate = function (models) {
		User.belongsToMany(models.Server, {
			through: models.ServerUser,
			foreignKey: "userId",
		});
	};

	User.prototype.comparePassword = function (password) {
		return bcrypt.compare(password, this.password);
	};

	return User;
};
