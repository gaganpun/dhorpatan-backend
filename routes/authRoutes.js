const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");

const router = express.Router();

const SECRET = "dhorpatan_secret_key";

/* =====================================
   REGISTER ADMIN
===================================== */

router.post("/register", async (req, res) => {

  console.log("REQ BODY:", req.body);

  try {

    const {
      firstName,
      lastName,
      email,
      department,
      password,
      confirmPassword,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (
      !firstName ||
      !lastName ||
      !email ||
      !department ||
      !password ||
      !confirmPassword
    ) {

      return res.status(400).json({
        message: "All fields are required",
      });

    }

    // =========================
    // PASSWORD MATCH
    // =========================

    if (password !== confirmPassword) {

      return res.status(400).json({
        message: "Passwords do not match",
      });

    }

    // =========================
    // CHECK EXISTING ADMIN
    // =========================

    const existingAdmin = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (existingAdmin.rows.length > 0) {

      return res.status(400).json({
        message: "Admin already exists",
      });

    }

    // =========================
    // HASH PASSWORD
    // =========================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // INSERT ADMIN
    // =========================

    const result = await pool.query(

      `INSERT INTO admins
      (
        first_name,
        last_name,
        email,
        department,
        password_hash
      )

      VALUES ($1, $2, $3, $4, $5)

      RETURNING
      id,
      first_name,
      last_name,
      email,
      department`,

      [
        firstName,
        lastName,
        email,
        department,
        hashedPassword,
      ]
    );

    // =========================
    // CREATE JWT TOKEN
    // =========================

    const token = jwt.sign(
      {
        id: result.rows[0].id,
      },
      SECRET,
      {
        expiresIn: "1d",
      }
    );

    // =========================
    // SUCCESS RESPONSE
    // =========================

    res.status(201).json({

      message: "Admin registered successfully",

      token,

      admin: {
        id: result.rows[0].id,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        email: result.rows[0].email,
        department: result.rows[0].department,
      },

    });

  } catch (err) {

    console.error("========== REGISTER ERROR ==========");
    console.error(err);

    res.status(500).json({

      message: err.message,
      detail: err.detail,
      code: err.code,

    });
  }
});


/* =====================================
   LOGIN ADMIN
===================================== */

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // =========================
    // FIND ADMIN
    // =========================

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

    // =========================
    // COMPARE PASSWORD
    // =========================

    const match = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!match) {

      return res.status(400).json({
        message: "Invalid password",
      });

    }

    // =========================
    // CREATE JWT TOKEN
    // =========================

    const token = jwt.sign(
      {
        id: admin.id,
      },
      SECRET,
      {
        expiresIn: "1d",
      }
    );

    // =========================
    // SUCCESS RESPONSE
    // =========================

    res.json({

      message: "Login successful",

      token,

      admin: {
        id: admin.id,
        firstName: admin.first_name,
        lastName: admin.last_name,
        email: admin.email,
        department: admin.department,
      },

    });

  } catch (err) {

    console.error("========== LOGIN ERROR ==========");
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;