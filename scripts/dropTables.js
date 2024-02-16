const db = require("../models"); // Import your Sequelize models

// Function to drop all tables considering dependencies
async function dropAllTablesConsideringDependencies() {
	// Drop tables with dependencies first
	const dependentModels = [db.ServerUser]; // Assuming ServerUser depends on User and Server
	for (const model of dependentModels) {
		await model.drop();
		console.log(`Table ${model.name} dropped (with dependencies).`);
	}

	// Now drop the independent tables
	const independentModels = [db.User, db.Server]; // Assuming these have no dependencies or are the base tables
	for (const model of independentModels) {
		await model.drop();
		console.log(`Table ${model.name} dropped.`);
	}
}

// Execute the drop script
dropAllTablesConsideringDependencies()
	.then(() => {
		console.log("All tables dropped successfully considering dependencies.");
	})
	.catch((error) => {
		console.error("Error dropping tables considering dependencies:", error);
	});
