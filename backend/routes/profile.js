const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET Profile
router.get('/:id', async (req, res) => {
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id).select('-password');
    } else {
      user = await User.findOne({ roleId: req.params.id }).select('-password');
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({
      success: true,
      data: user.toObject()
    });
  } catch (error) {
    console.error("GET profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PUT Profile (Update)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    
    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ roleId: userId });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    for (const key in updateData) {
      if (key !== '_id' && key !== 'role' && key !== 'email' && key !== 'uniqueId') {
        user.set(key, updateData[key]);
      }
    }

    user.updatedAt = Date.now();
    await user.save();

    return res.status(200).json({
      success: true,
      data: user.toObject()
    });
  } catch (error) {
    console.error("PUT profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
