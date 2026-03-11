const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: String,
  phone: Number,
  password: String,
});

module.exports = mongoose.model("user", userschema);
