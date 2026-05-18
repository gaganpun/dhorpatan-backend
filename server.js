const express = require("express");
const pool = require("./db");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (keep your existing ones if needed)
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

app.use("/admin", adminRoutes);
app.use("/api/auth", authRoutes);

/* -----------------------------
   POSTGRESQL: CONTACT API
------------------------------*/
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const firstName = name.split(" ")[0] || "";
    const lastName = name.split(" ")[1] || "";

    const result = await pool.query(
      `INSERT INTO contact_messages 
      (first_name, last_name, full_name, email, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [firstName, lastName, name, email, message]
    );

    res.status(201).json({
      message: "Contact saved successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/* -----------------------------
   POSTGRESQL: JOIN API
------------------------------*/
app.post("/api/join", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, jerseySize } = req.body;

    if (!firstName || !lastName || !phone || !email || !jerseySize) {
      return res.status(400).json({ message: "All fields required" });
    }

    const result = await pool.query(
      `INSERT INTO members 
      (first_name, last_name, phone, email, jersey_size)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [firstName, lastName, phone, email, jerseySize]
    );

    res.status(201).json({
      message: "Member registered successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/* -----------------------------
   ADMIN DASHBOARD (STATIC)
------------------------------*/
app.get("/api/admin/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome Admin",
    data: {
      club: "Dhorpatan Club Australia",
      members: 120,
      events: 5,
      notices: ["Match on Sunday", "Training at 6PM"],
    },
  });
});

/* -----------------------------
   POSTGRES CONNECTION TEST
------------------------------*/
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ PostgreSQL connection error:", err.message);
  } else {
    console.log("✅ PostgreSQL connected:", result.rows[0]);
  }
});

/* -----------------------------
   START SERVER
------------------------------*/
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});