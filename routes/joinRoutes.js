const express = require("express");
const router = express.Router();
const Join = require("../models/Join");

// POST /api/join - create new submission
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, jerseySize } = req.body;
    if (!firstName || !lastName || !phone || !email || !jerseySize) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const doc = await Join.create({ firstName, lastName, phone, email, jerseySize });
    return res.status(201).json({ message: "Join form saved", data: doc });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/join/:id - delete submission
router.delete("/:id", async (req, res) => {
  try {
    await Join.findByIdAndDelete(req.params.id);
    res.json({ message: "Join application deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/join/:id - update submission
router.put("/:id", async (req, res) => {
  try {
    const updated = await Join.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Join application updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
