const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

const SECRET = "dhorpatan_secret_key";

/* --------------------------------
   REGISTER ADMIN
-------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = req.body;

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    // Password match check
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Check existing admin
    const existingAdmin = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    const result = await pool.query(
      `INSERT INTO admins
      (first_name, last_name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, first_name, last_name, email`,
      [firstName, lastName, email, hashedPassword]
    );

    // Create token
    const token = jwt.sign(
      { id: result.rows[0].id },
      SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

/* --------------------------------
   LOGIN ADMIN
-------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const result = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Admin not found",
      });
    }

    const admin = result.rows[0];

    // Compare password
    const match = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!match) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: admin.id },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        firstName: admin.first_name,
        lastName: admin.last_name,
        email: admin.email,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;