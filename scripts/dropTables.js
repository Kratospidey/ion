const db = require("../models"); // Import your Sequelize models

// Function to drop all tables considering dependencies
async function dropAllTablesConsideringDependencies() {
	try {
		if (db.Message) {
			await db.Message.drop();
			console.log("Table Message dropped.");
		}

		// Drop tables with dependencies first
		if (db.ServerUser) {
			await db.ServerUser.drop();
			console.log("Table ServerUser dropped.");
		}

		// Drop the Server table next, as it has a foreign key dependency on User
		if (db.Server) {
			await db.Server.drop();
			console.log("Table Server dropped.");
		}

		// Finally, drop the User table
		if (db.User) {
			await db.User.drop();
			console.log("Table User dropped.");
		}

		console.log("All tables dropped successfully considering dependencies.");
	} catch (error) {
		console.error("Error dropping tables considering dependencies:", error);
	}
}

// Execute the drop script
dropAllTablesConsideringDependencies();
