import mongoose from "mongoose";

const contactschema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: String,
    phone: Number,
    address: String,
    gender: String,
    userrefId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    imageUrl: String,
    imageId: String,
  },
  { timestamps: true },
);

const Contact = mongoose.model("contact", contactschema);

export default Contact;
