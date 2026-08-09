const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');

const userFields = [
  'name', 'mobileNumber', 'dob', 'gender', 'permanentAddress', 
  'state', 'district', 'village', 'pinCode', 'profilePhoto', 
  'aadhaarNumber', 'aadhaarFront', 'aadhaarBack', 'submitKyc', 
  'kycStatus', 'rejectionReason', 'verificationDate'
];

// GET Profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let roleDoc = {};
    if (user.roleId) {
      roleDoc = await Role.findById(user.roleId) || {};
    }
    
    // We send back the user object which includes email, role, and we attach role details
    const userData = user.toObject();
    userData.profileDetails = roleDoc;

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

    let roleDoc = null;
    if (user.roleId) {
      roleDoc = await Role.findById(user.roleId);
      if (!roleDoc) {
        roleDoc = new Role({ _id: user.roleId, userId: user._id, role: user.role });
      }
    }

    // Split updates
    for (const key in updateData) {
      if (userFields.includes(key)) {
        user.set(key, updateData[key]);
      } else if (roleDoc && key !== '_id' && key !== 'roleId' && key !== 'role' && key !== 'userId') {
        roleDoc.set(key, updateData[key]);
      }
    }

    user.updatedAt = Date.now();
    await user.save();

    if (roleDoc) {
      roleDoc.updatedAt = Date.now();
      await roleDoc.save();
    }
    
    const userData = user.toObject();
    userData.profileDetails = roleDoc || {};

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
