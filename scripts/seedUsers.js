// seedUsers.js
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


const mongoose = require("mongoose");
const { User } = require("../models");

const bcrypt = require("bcrypt"); // For hashing passwords

const seedServers = require("./seedServers");

const MONGODB_URL = process.env.MONGODB_URL;

async function seedUsers() {
	try {
		await mongoose.connect(MONGODB_URL);

		const users = [
			{
				username: "user1",
				email: "user1@example.com",
				password: await bcrypt.hash("password1", 10), // Hash the password
				profilePicture: "/img/useravatar.png", // Add the userPFP field
			},
			{
				username: "user2",
				email: "user2@example.com",
				password: await bcrypt.hash("password2", 10),
				profilePicture: "/img/useravatar.png", // Add the userPFP field
			},
			{
				username: "user3",
				email: "user3@example.com",
				password: await bcrypt.hash("password3", 10),
				profilePicture: "/img/useravatar.png", // Add the userPFP field
			},
			{
				username: "user4",
				email: "user4@example.com",
				password: await bcrypt.hash("password4", 10),
				profilePicture: "/img/useravatar.png", // Add the userPFP field
			},
			{
				username: "user5",
				email: "user5@example.com",
				password: await bcrypt.hash("password5", 10),
				profilePicture: "/img/useravatar.png", // Add the userPFP field
			},
			{
				username: "user6",
				email: "user6@example.com",
				password: await bcrypt.hash("password6", 10),
				profilePicture: "/img/useravatar.png", // Add the userPFP field
			},
			// Add more user objects as needed
		];

		// Save each user and collect their IDs
		const userIds = [];
		for (const user of users) {
			const savedUser = await new User(user).save();
			userIds.push(savedUser._id);
		}

		console.log("Users seeded successfully");
		return userIds; // Return the array of user IDs
	} catch (err) {
		console.error("Error seeding users:", err);
	} finally {
		await mongoose.connection.close();
	}
}

// Call the seedUsers function and use the returned user IDs in the seedServers function
seedUsers()
	.then((userIds) => {
		// Define the mappings for servers and users
		const serverUserMappings = [
			{
				name: "Cat",
				profilePicture: "/img/cat.jpg",
				userIds: [userIds[0], userIds[1]],
				filePaths: [],
			},
			{
				name: "Dog",
				profilePicture: "/img/dog.jpg",
				userIds: [userIds[2], userIds[4]],
				filePaths: [],
			},
			{
				name: "Monkey",
				profilePicture: "/img/monkey.jpg",
				userIds: [userIds[3], userIds[5]],
				filePaths: [],
			},
			{
				name: "Horse",
				profilePicture: "/img/horse.jpg",
				userIds: [userIds[0], userIds[2]],
				filePaths: [],
			},
		];
		seedServers(serverUserMappings);
	})
	.catch((err) => {
		console.error("Error seeding users:", err);
	});
