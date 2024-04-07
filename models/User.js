// models/User.js
const bcrypt = require("bcrypt"); // For hashing passwords


/**
 * Defines the User model using Sequelize. The User model represents users of the application, with fields for
 * username, password, email, profile picture, account creation time, and last login time. The password field
 * utilizes bcrypt for hashing to ensure secure storage. The model includes unique constraints on both username
 * and email to prevent duplicates. Additionally, the model is associated with the Server model through the ServerUser
 * join table, enabling many-to-many relationships between users and servers.
 *
 * The User model also extends with a prototype method `comparePassword` to facilitate password comparison during
 * authentication, leveraging bcrypt's compare function to match the provided password with the stored hashed password.
 *
 * @module User
 * @param {object} sequelize - Sequelize instance.
 * @param {object} DataTypes - Sequelize data types.
 * @returns {object} The Sequelize model for User.
 * 
 * @example
 * // Defining the User model in your Sequelize setup
 * const User = sequelize.define('User', {
 *   username: DataTypes.STRING,
 *   // other fields...
 * });
 *
 * @example
 * // Using the comparePassword method for a User instance
 * User.findOne({ where: { username: 'johnDoe' } })
 *   .then(user => user.comparePassword('password123'))
 *   .then(isMatch => console.log('Password match:', isMatch));
 */

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
