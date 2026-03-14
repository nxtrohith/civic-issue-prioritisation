const express = require("express");
const User = require("../../models/User.model");

const router = express.Router();

// GET all users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find().select("-__v");
    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
});

// GET user by ID
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// CREATE new user
router.post("/", async (req, res, next) => {
  try {
    const { clerkUserId, fullName, email, phone, imageUrl, role } = req.body;

    if (!clerkUserId || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "clerkUserId, fullName, and email are required"
      });
    }

    const newUser = new User({
      clerkUserId,
      fullName,
      email,
      phone,
      imageUrl,
      role: role || "resident"
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      success: true,
      data: savedUser
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email or clerkUserId already exists"
      });
    }
    next(error);
  }
});

// UPDATE user
router.put("/:id", async (req, res, next) => {
  try {
    const allowedFields = ["fullName", "phone", "imageUrl", "role", "isActive"];
    const updateData = {};

    allowedFields.forEach(field => {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// DELETE user
router.delete("/:id", async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
