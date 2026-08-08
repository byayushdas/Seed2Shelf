const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RoleInfo = require('../models/RoleInfo');

// GET Profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const roleInfo = await RoleInfo.findOne({ email: user.email });
    
    // We send back the user object which includes email, role, and profileDetails
    // We dynamically attach roleInfo to profileDetails to maintain frontend compatibility
    const userData = user.toObject();
    userData.profileDetails = roleInfo || {};

    return res.status(200).json({
      success: true,
      data: userData
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
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let roleInfo = await RoleInfo.findOne({ email: user.email });
    
    if (!roleInfo) {
      roleInfo = new RoleInfo({ _id: "PENDING_" + Date.now(), email: user.email, role: user.role, roleId: "PENDING" });
    }

    // Update RoleInfo with new fields
    for (const key in updateData) {
      roleInfo.set(key, updateData[key]);
    }
    
    roleInfo.updatedAt = Date.now();
    await roleInfo.save();
    
    const userData = user.toObject();
    userData.profileDetails = roleInfo;

    return res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error("PUT profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
