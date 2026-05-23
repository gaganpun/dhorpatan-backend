
require("dotenv").config();

console.log("DATABASE_URL =", process.env.DATABASE_URL);




const express = require("express");
const cors = require("cors");

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

const PORT = process.env.PORT || 5000;


/* ======================================
   MIDDLEWARE
====================================== */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


/* ======================================
   ROUTES
====================================== */


app.use("/api/auth", authRoutes);


/* ======================================
   CONTACT API
====================================== */

app.post("/api/contact", async (req, res) => {

  try {

    const {
      name,
      email,
      message
    } = req.body;

    if (!name || !email || !message) {

      return res.status(400).json({
        message: "All fields required"
      });

    }

    const firstName = name.split(" ")[0] || "";

    const lastName = name.split(" ")[1] || "";

    const result = await pool.query(

      `INSERT INTO contact_messages
      (
        first_name,
        last_name,
        full_name,
        email,
        message
      )

      VALUES ($1, $2, $3, $4, $5)

      RETURNING *`,

      [
        firstName,
        lastName,
        name,
        email,
        message
      ]
    );

    res.status(201).json({

      message: "Contact saved successfully",

      data: result.rows[0]

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });
  }

});


/* ======================================
   JOIN API
====================================== */

app.post("/api/join", async (req, res) => {

  try {

    const {
      firstName,
      lastName,
      phone,
      email,
      jerseySize
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !jerseySize
    ) {

      return res.status(400).json({
        message: "All fields required"
      });

    }

    const result = await pool.query(

      `INSERT INTO members
      (
        first_name,
        last_name,
        phone,
        email,
        jersey_size
      )

      VALUES ($1, $2, $3, $4, $5)

      RETURNING *`,

      [
        firstName,
        lastName,
        phone,
        email,
        jerseySize
      ]
    );

    res.status(201).json({

      message: "Member registered successfully",

      data: result.rows[0]

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });
  }

});


/* ======================================
   ADMIN DASHBOARD
====================================== */

app.get(
  "/api/admin/dashboard",
  authMiddleware,

  (req, res) => {

    res.json({

      message: "Welcome Admin",

      data: {

        club: "Dhorpatan Club Australia",

        members: 120,

        events: 5,

        notices: [
          "Match on Sunday",
          "Training at 6PM"
        ],

      },

    });

  }
);


/* ======================================
   POSTGRESQL CONNECTION TEST
====================================== */

pool.query(
  "SELECT NOW()",

  (err, result) => {

    if (err) {

      console.error(
        "❌ PostgreSQL connection error:"
      );

      console.error(err);

    } else {

      console.log(
        "✅ PostgreSQL connected:"
      );

      console.log(result.rows[0]);

    }

  }
);


/* ======================================
   START SERVER
====================================== */

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});