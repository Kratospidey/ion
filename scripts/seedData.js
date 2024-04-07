/**
 * A script to synchronize the Sequelize model definitions with the database, effectively creating or re-creating the tables
 * based on the models. The script uses the `sync` method with the `{ force: true }` option, which first drops existing tables
 * and then creates new ones according to the model definitions. This approach is particularly useful during development or
 * testing phases, where a fresh database schema is often required.
 *
 * Anyone running this should be careful when using this in a production environment, as it will result in loss of all existing data 
 * in the database. The script logs a success message upon completion or an error message if the synchronization fails, providing immediate feedback
 * about the operation's outcome.
 *
 * @async
 * @function defineTables
 * @requires db - The Sequelize models object imported from the models directory, containing the Sequelize instance and all defined Sequelize models.
 * 
 * @example
 * // Running the script to define and declare tables based on models
 * defineTables()
 *   .then(() => console.log('Database tables defined successfully.'))
 *   .catch(error => console.error('Failed to define database tables:', error));
 */

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
