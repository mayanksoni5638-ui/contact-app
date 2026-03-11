import dotenv from "dotenv";
dotenv.config();

import express from "express";
import contact from "../models/ContactSch.js";
import checkAuth from "../middleware/checkAuth.js";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";

const Router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET, // fixed: should be api_secret, not api_key
});

// add contact
Router.post("/addContact", checkAuth, async (req, res) => {
  try {
    const file = req.files.image;
    const fileUploaded = await cloudinary.uploader.upload(file.tempFilePath);

    const newcontact = new contact({
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      userrefId: req.user._id,
      imageUrl: fileUploaded.secure_url,
      imageId: fileUploaded.public_id,
    });

    const result = await newcontact.save();
    res.status(200).json({ naya_contact_added: result });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// get all contacts
Router.get("/allContact", checkAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const data = await contact
      .find({ userrefId: req.user._id })
      .select("fullname email address phone gender userrefId imageUrl imageId")
      .skip(skip)
      .limit(limit);

    res.status(200).json({ contact_list: data });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// get contact by id
Router.get("/contactbyid/:id", checkAuth, async (req, res) => {
  try {
    const idData = await contact.findById(req.params.id);

    if (!idData) {
      return res.status(404).json({ error: "Contact not found" });
    }

    if (idData.userrefId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({ contactById: idData });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// get contact by gender
Router.get("/byGender/:gender", checkAuth, async (req, res) => {
  try {
    const genderData = await contact.find({
      userrefId: req.user._id,
      gender: req.params.gender,
    });

    res.status(200).json({ contactByGender: genderData });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// delete data by id
Router.delete("/delete/:id", checkAuth, async (req, res) => {
  try {
    const data = await contact.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Contact not found" });
    }

    if (data.userrefId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await cloudinary.uploader.destroy(data.imageId);
    await contact.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// delete by gender
Router.delete("/deleteByGender/:gender", checkAuth, async (req, res) => {
  try {
    const result = await contact.deleteMany({
      gender: req.params.gender,
      userrefId: req.user._id,
    });

    res.status(200).json({
      message: `${result.deletedCount} contact(s) deleted successfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// update contact
Router.put("/update/:id", checkAuth, async (req, res) => {
  try {
    const data = await contact.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Contact not found" });
    }

    if (data.userrefId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updateddata = {
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      userrefId: data.userrefId,
    };

    if (req.files) {
      await cloudinary.uploader.destroy(data.imageId);
      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
      );
      updateddata.imageUrl = result.secure_url;
      updateddata.imageId = result.public_id;
    } else {
      updateddata.imageUrl = data.imageUrl;
      updateddata.imageId = data.imageId;
    }

    const result = await contact.findByIdAndUpdate(req.params.id, updateddata, {
      new: true,
    });
    res.status(200).json({ updated_contact: result });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// count total contacts
Router.get("/count", checkAuth, async (req, res) => {
  try {
    const total = await contact.countDocuments({ userrefId: req.user._id });
    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

export default Router;
