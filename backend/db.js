console.log("db.js loaded");
import dotenv from "dotenv";
import pg from "pg";
dotenv.config();
const { Pool } = pg;

console.log("User: ", process.env.DB_USER);
console.log("ENV FILE TEST:", process.env.DB_HOST);

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("DB CONNECTION ERROR:", err));

export default db;
