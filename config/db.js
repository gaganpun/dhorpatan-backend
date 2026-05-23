const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

console.log("DATABASE_URL:", connectionString);

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => {
    console.log("✅ PostgreSQL connected");
  })
  .catch((err) => {
    console.error("❌ FULL DB ERROR:");
    console.error(err);
  });

module.exports = pool;