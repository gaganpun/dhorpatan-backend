const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/admin", adminRoutes);
app.use("/api/auth", authRoutes);

const Contact = require("./models/ContactModel");
const Join = require("./models/JoinModel");

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const data = await Contact.create({ name, email, message });

    res.status(201).json({ message: "Contact saved", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/join", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, jerseySize } = req.body;

    if (!firstName || !lastName || !phone || !email || !jerseySize) {
      return res.status(400).json({ message: "All fields required" });
    }

    const data = await Join.create({
      firstName,
      lastName,
      phone,
      email,
      jerseySize,
    });

    res.status(201).json({ message: "Join saved", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const authMiddleware = require("./middleware/authMiddleware");

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