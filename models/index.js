// models/index.js

/**
 * Initializes Sequelize and imports all model definitions within the application. This script sets up the Sequelize
 * connection based on the environment (development or production) and dynamically reads all JavaScript files in the
 * current directory, excluding itself, to import and configure model definitions.
 *
 * In production environments, it uses environment variables to configure the Sequelize connection, including database
 * credentials and connection details. For all environments, it assumes a MySQL dialect and configures connection pooling
 * and SSL settings as necessary.
 *
 * After importing all models, it iterates over them to establish any defined associations, effectively setting up the
 * relational mappings between different entities in the application. The Sequelize instance and the Sequelize library
 * itself are then attached to the exported `db` object, allowing for easy access throughout the application.
 *
 * @module models/index
 * @requires fs
 * @requires path
 * @requires dotenv
 * @requires sequelize
 * 
 * @example
 * // Accessing the db object to use models and Sequelize in your application
 * const db = require('./models');
 * const { User, Message } = db;
 * // Use User, Message, etc. for database operations
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const Sequelize = require("sequelize");

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (env === "production") {
	console.log(
		`${process.env.DB_NAME} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_HOST}`
	);
	sequelize = new Sequelize(
		process.env.DB_NAME,
		process.env.DB_USER,
		process.env.DB_PASSWORD,
		{
			host: process.env.DB_HOST,
			dialect: "mysql",
			pool: {
				max: 5,
				min: 0,
				idle: 10000,
			},
			dialectOptions: {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
			},
		}
	);
} else {
	sequelize = new Sequelize(
		process.env.DB_NAME,
		process.env.DB_USER,
		process.env.DB_PASSWORD,
		{
			host: process.env.DB_HOST,
			dialect: "mysql",
			dialectOptions: {
				ssl: {
					require: true,
					rejectUnauthorized: false,
					encrpyt: true,
				},
			},
		}
	);
}

fs.readdirSync(__dirname)
	.filter((file) => {
		return (
			file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
		);
	})
	.forEach((file) => {
		const model = require(path.join(__dirname, file))(
			sequelize,
			Sequelize.DataTypes
		);
		db[model.name] = model;
	});

// Set up associations after all models are imported
Object.keys(db).forEach((modelName) => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
