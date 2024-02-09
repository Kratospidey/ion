const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // For hashing passwords


// User model
const userSchema = new mongoose.Schema({
	username: String,
	password: String, // Store hashed passwords
	email: String,
	profilePicture: String, // URL to the profile picture
	createdAt: Date,
	lastLogin: Date,
});

// Method to compare a plain-text password with the stored hashed password
userSchema.methods.comparePassword = async function (plainTextPassword) {
	return await bcrypt.compare(plainTextPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
