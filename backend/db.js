console.log("db.js loaded");
import dotenv from "dotenv";
import pg from "pg";
dotenv.config();
const { Pool } = pg;

console.log("User: ", process.env.DB_USER);
console.log("Host: ", process.env.DB_PASSWORD);

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: 5432,
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("DB CONNECTION ERROR:", err));

export default db;
