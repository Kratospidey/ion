// models/index.js
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
