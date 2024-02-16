// seed.js
const db = require("../models");
const { User, Server, ServerUser } = db;
const bcrypt = require("bcrypt"); // Import bcrypt

// Function to seed users
async function seedUsers() {
	// Create new users
	const users = await User.bulkCreate([
		{
			username: "user1",
			password: await bcrypt.hash("password1", 10), // Hash the password

			email: "user1@example.com",
		},
		{
			username: "user2",
			password: await bcrypt.hash("password2", 10), // Hash the password

			email: "user2@example.com",
		},
		{
			username: "user3",
			password: await bcrypt.hash("password3", 10), // Hash the password

			email: "user3@example.com",
		},
		{
			username: "user4",
			password: await bcrypt.hash("password4", 10), // Hash the password

			email: "user4@example.com",
		},
		{
			username: "user5",
			password: await bcrypt.hash("password5", 10), // Hash the password

			email: "user5@example.com",
		},
		{
			username: "user6",
			password: await bcrypt.hash("password6", 10), // Hash the password
			email: "user6@example.com",
		},
		// Add more users as needed
	]);

	console.log("Users seeded:", users);
}

// Function to seed servers
async function seedServers() {
	// Create new servers
	const servers = await Server.bulkCreate([
		{
			name: "Cat",
			profilePicture: "/img/cat.jpg",
			filePaths: [],
		},
		{
			name: "Dog",
			profilePicture: "/img/dog.jpg",
			filePaths: [],
		},
		{
			name: "Monkey",
			profilePicture: "/img/monkey.jpg",
			filePaths: [],
		},
		{
			name: "Horse",
			profilePicture: "/img/horse.jpg",
			filePaths: [],
		},
	]);

	console.log("Servers seeded:", servers);
}

// Function to seed server-user relationships
async function seedServerUsers() {
	// Create server-user relationships
	const serverUsers = await ServerUser.bulkCreate([
		{ serverId: 1, userId: 1 },
		{ serverId: 1, userId: 2 },
		{ serverId: 2, userId: 3 },
		{ serverId: 2, userId: 5 },
		{ serverId: 3, userId: 4 },
		{ serverId: 3, userId: 6 },
		{ serverId: 4, userId: 1 },
		{ serverId: 4, userId: 3 },
	]);

	console.log("Server-user relationships seeded:", serverUsers);
}

// Run the seed functions
async function seedDatabase() {
	await seedUsers();
	await seedServers();
	await seedServerUsers();
}

// Execute the seed script
db.sequelize
	.sync()
	.then(() => seedDatabase())
	.then(() => {
		console.log("Database seeded successfully");
	})
	.catch((error) => {
		console.error("Error seeding database:", error);
	});
