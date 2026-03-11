require("dotenv").config();
const express = require("express");
const Router = express.Router();
const contact = require("../models/ContactSch");
const checkAuth = require("../middleware/checkAuth");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_key: process.env.API_SECRET,
});

// add contact
Router.post("/addContact", checkAuth, async (req, res) => {
  console.log("adding contact.......");

  try {
    const file = req.files.image;
    const fileuploded = await cloudinary.uploader.upload(file.tempFilePath);
    const newcontact = new contact({
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      userrefId: req.user._id,
      imageUrl: fileuploded.secure_url,
      imageId: fileuploded.public_id,
    });

    const result = await newcontact.save();

    res.status(200).json({
      naya_contact_added: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || err,
    });
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
      .populate("userId", " fullname phone email address")
      .select("fullname email address phone gender userId imageUrl imageId")
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      contact_list: data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || err,
    });
  }
});

// get contact by id
Router.get("/contactbyid/:id", checkAuth, async (req, res) => {
  try {
    const idData = await contact.findById(req.params.id);

    if (!idData) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Check if the contact belongs to the authenticated user
    if (idData.userrefId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        error: "Unauthorized: This contact doesn't belong to you",
      });
    }

    res.status(200).json({
      contactById: idData,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// get contact by gender
Router.get("/byGender/:gender", checkAuth, async (req, res) => {
  try {
    const genderData = await contact.find({
      userrefId: req.user._id,
      gender: req.params.gender,
    });

    res.status(200).json({
      contactByGender: genderData,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// delete data by id
Router.delete("/delete/:id", checkAuth, async (req, res) => {
  try {
    const data = await contact.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Check if the contact belongs to the authenticated user
    if (data.userrefId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        error: "Unauthorized: You can only delete your own contacts",
      });
    }
    await cloudinary.uploader.destroy(data.imageId);

    await contact.deleteOne({ _id: req.params.id });
    res.status(200).json({
      message: "Contact deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
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
    res.status(500).json({
      error: err,
    });
  }
});

// update api

Router.put("/update/:id", checkAuth, async (req, res) => {
  try {
    if (data.userrefId.toString() != user._id.toString()) {
      return res.status(500).json({
        error: "invalid user",
      });
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
      // to update image
      // delete image from cloudinary
      await cloudinary.uploader.destroy(data.imageId);
      // upload new image
      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
      );
      // set new imageurl and imageid
      updateddata.imageUrl = result.secure_url;
      updateddata.imageId = result.public_id;
    } else {
      updateddata.imageUrl = data.imageUrl;
      updateddata.imageId = data.imageId;
    }
    const result = await contact.findByIdAndUpdate(req.params.id, updateddata, {
      new: true,
    });
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// count total contacts
Router.get("/count", checkAuth, async (req, res) => {
  try {
    const total = await contact.countDocuments({ userrefId: user._id });
    res.status(200).json({
      total: total,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});
module.exports = Router;
