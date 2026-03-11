import express from "express";
import user from "../models/UserSch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Router = express.Router();

// signup
Router.post("/signup", async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await user.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
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
    const existingUser = await user.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(400).json({ error: "Email not registered" });
    }

    const isPassCorrect = await bcrypt.compare(
      req.body.password,
      existingUser.password,
    );

    if (!isPassCorrect) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        _id: existingUser._id,
        fullname: existingUser.fullname,
        email: existingUser.email,
        phone: existingUser.phone,
      },
      process.env.JWT_SECRET || "may@123", // safer to use env variable
      { expiresIn: "7d" },
    );

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

export default Router;
