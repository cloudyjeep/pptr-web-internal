import path from "path";
import { Sequelize, DataTypes } from "sequelize";

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "assets", "db.sqlite"),
});

/**
 * Database initialization and model definition for Sequelize ORM.
 * This module exports a function to initialize the database and a User model.
 */
export async function initDatabase() {
  console.log("Initializing database...");
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));
  return await sequelize.sync();
}

/**
 * Database model definition for Sequelize ORM.
 * This module defines a function to create a model with specified attributes and options,
 * and exports a User model representing a user table in the database.
 */
export function defineModel(
  tableName: string,
  attributes: Parameters<typeof sequelize.define>[1],
  options?: Parameters<typeof sequelize.define>[2]
) {
  return sequelize.define(tableName, attributes, { tableName, ...options });
}
