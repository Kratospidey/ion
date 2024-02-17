const db = require("../models");

// Function to define and declare tables based on models
async function defineTables() {
	try {
		// Sync all models with the database
		await db.sequelize.sync({ force: true });
		console.log("Tables have been defined and declared successfully");
	} catch (error) {
		console.error("Error defining tables:", error);
	}
}

// Execute the table definition script
defineTables();
