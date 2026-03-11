import mongoose from "mongoose";

const userschema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: String,
  phone: Number,
  password: String,
});

const User = mongoose.model("user", userschema);

export default User;
