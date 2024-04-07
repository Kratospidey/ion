/**
 * A script to drop all database tables in a specific order to respect foreign key dependencies. It ensures that tables
 * with dependencies on other tables are dropped first, preventing issues with foreign keys. The script sequentially drops
 * tables in the order of Message, ServerUser, Server, and finally User, logging each action to the console.
 *
 * This approach is necessary because certain tables depend on others. For example, ServerUser entries depend on both Server
 * and User entries, so the ServerUser table must be dropped before the Server and User tables. Similarly, the Server table
 * depends on the User table (due to the ownerId foreign key), so it must be dropped before the User table.
 *
 * The function wraps the drop operations in a try-catch block to handle any errors that may occur during the process, such
 * as attempting to drop a table that doesn't exist or violating a foreign key constraint.
 *
 * @async
 * @function dropAllTablesConsideringDependencies
 * @requires db - The Sequelize models object imported from the models directory, containing all defined Sequelize models.
 * 
 * @example
 * // Running the script to drop all tables
 * dropAllTablesConsideringDependencies()
 *   .then(() => console.log('Finished dropping tables.'))
 *   .catch(error => console.error('Error during table drop:', error));
 */
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
