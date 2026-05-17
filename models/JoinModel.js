const mongoose = require("mongoose");

const joinSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    jerseySize: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Join", joinSchema);
