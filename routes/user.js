const express = require("express");
const Router = express.Router();
const user = require("../models/UserSch");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// signup
Router.post("/signup", async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await user.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        // Use 400 for bad request
        error: "Email already registered",
      });
    }

    // Hash password
    const hash = await bcrypt.hash(req.body.password, 10);

    // Create new user
    const newUser = new user({
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      password: hash,
    });

    const new_user_data = await newUser.save();

    // Don't send password back in response
    const userResponse = new_user_data.toObject();
    delete userResponse.password;

    res.status(201).json({
      // Use 201 for resource creation
      newUser: userResponse,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// login
Router.post("/login", async (req, res) => {
  try {
    // Check if user exists
    const existingUser = await user.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(400).json({ error: "Email not registered" });
    }

    // Compare passwords
    const isPassCorrect = await bcrypt.compare(
      req.body.password,
      existingUser.password,
    );

    if (!isPassCorrect) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Create JWT token with user data - FIXED: removed duplicates and using existingUser
    const token = jwt.sign(
      {
        _id: existingUser._id, // Use existingUser, not user model
        fullname: existingUser.fullname,
        email: existingUser.email,
        phone: existingUser.phone,
      },
      "may@123", // Consider using process.env.JWT_SECRET
      { expiresIn: "7d" },
    );

    // Send response
    res.status(200).json({
      _id: existingUser._id,
      fullname: existingUser.fullname,
      email: existingUser.email,
      phone: existingUser.phone,
      token: token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = Router;
