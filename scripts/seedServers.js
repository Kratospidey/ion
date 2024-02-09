// seedServers.js
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require("mongoose");
const { Server } = require("../models");
const MONGODB_URL = process.env.MONGODB_URL;

async function seedServers(serverUserMappings) {
	try {
		await mongoose.connect(MONGODB_URL);

		const servers = serverUserMappings.map((mapping) => ({
			name: mapping.name,
			profilePicture: mapping.profilePicture,
			userIds: mapping.userIds,
		}));

		await Server.insertMany(servers);
		console.log("Servers seeded successfully");
	} catch (err) {
		console.error("Error seeding servers:", err);
	} finally {
		await mongoose.connection.close();
	}
}

// Export the seedServers function so it can be imported and used elsewhere
module.exports = seedServers;
