const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RoleInfo = require('../models/RoleInfo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "user already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role
    });

    let roleId = "PENDING";
    
    // Generate role-specific IDs
    if (role === "FARMER") {
      const lastRoleInfo = await RoleInfo.findOne({ role: "FARMER", roleId: { $ne: "PENDING" } })
        .sort({ roleId: -1 });
      let nextNum = 1;
      if (lastRoleInfo && lastRoleInfo.roleId) {
        const match = lastRoleInfo.roleId.match(/S2S-FRM-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = `S2S-FRM-${String(nextNum).padStart(6, '0')}`;
    } else if (role === "PROCESSOR") {
      const lastRoleInfo = await RoleInfo.findOne({ role: "PROCESSOR", roleId: { $ne: "PENDING" } })
        .sort({ roleId: -1 });
      let nextNum = 1;
      if (lastRoleInfo && lastRoleInfo.roleId) {
        const match = lastRoleInfo.roleId.match(/S2S-PRC-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = `S2S-PRC-${String(nextNum).padStart(6, '0')}`;
    } else if (role === "ADMIN") {
      const lastRoleInfo = await RoleInfo.findOne({ role: "ADMIN", roleId: { $ne: "PENDING" } })
        .sort({ roleId: -1 });
      let nextNum = 1;
      if (lastRoleInfo && lastRoleInfo.roleId) {
        const match = lastRoleInfo.roleId.match(/S2S-ADM-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = `S2S-ADM-${String(nextNum).padStart(6, '0')}`;
    } else if (role === "DISTRIBUTOR") {
      const lastRoleInfo = await RoleInfo.findOne({ role: "DISTRIBUTOR", roleId: { $ne: "PENDING" } })
        .sort({ roleId: -1 });
      let nextNum = 1;
      if (lastRoleInfo && lastRoleInfo.roleId) {
        const match = lastRoleInfo.roleId.match(/S2S-DST-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = `S2S-DST-${String(nextNum).padStart(6, '0')}`;
    } else if (role === "RETAILER") {
      const lastRoleInfo = await RoleInfo.findOne({ role: "RETAILER", roleId: { $ne: "PENDING" } })
        .sort({ roleId: -1 });
      let nextNum = 1;
      if (lastRoleInfo && lastRoleInfo.roleId) {
        const match = lastRoleInfo.roleId.match(/S2S-RET-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = `S2S-RET-${String(nextNum).padStart(6, '0')}`;
    }

    const roleInfo = await RoleInfo.create({
      _id: roleId,
      email: normalizedEmail,
      role: role,
      roleId: roleId
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '1d' }
    );

    return res.status(201).json({ 
      message: "User created successfully", 
      userId: user._id,
      token,
      user: { id: user._id, role: user.role, email: user.email, profileDetails: roleInfo }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "account not registered" });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.status(401).json({ message: "Invalid password credentials" });
    }

    const roleInfo = await RoleInfo.findOne({ email: normalizedEmail });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileDetails: roleInfo || {}
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
