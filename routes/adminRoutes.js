// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const ContactModel = require("../models/ContactModel");
const JoinModel = require("../models/JoinModel");

// GET /admin/data → returns all contacts & joins
router.get("/data", async (req, res) => {
  try {
    const contacts = await ContactModel.find({}).sort({ createdAt: -1 });
    const joins = await JoinModel.find({}).sort({ createdAt: -1 });

    // Ensure structure matches frontend
    res.json({ contacts, joins });
  } catch (err) {
    console.error("Failed to fetch admin data:", err);
    res.status(500).json({ error: "Failed to fetch admin data" });
  }
});

module.exports = router;
