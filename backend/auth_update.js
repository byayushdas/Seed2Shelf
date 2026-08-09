const fs = require('fs');

let content = fs.readFileSync('routes/auth.js', 'utf8');

// Replace RoleInfo with Role
content = content.replace(/const RoleInfo = require\('\.\.\/models\/RoleInfo'\);/g, "const Role = require('../models/Role');");

// Update /signup
content = content.replace(/const { email, password, role } = req.body;/g, "const { name, email, password, role } = req.body;");

// Update roleId generation block to use User instead of RoleInfo
content = content.replace(/RoleInfo\.findOne\(\{ role:/g, "User.findOne({ role:");
content = content.replace(/lastRoleInfo/g, "lastUser");

// Now we need to move User.create AFTER roleId generation
// I'll rewrite the entire signup block
const newSignup = `
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "user already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let roleId = "PENDING";
    
    // Generate role-specific IDs
    if (role === "FARMER") {
      const lastUser = await User.findOne({ role: "FARMER", roleId: { $exists: true, $ne: "PENDING" } }).sort({ roleId: -1 });
      let nextNum = 1;
      if (lastUser && lastUser.roleId) {
        const match = lastUser.roleId.match(/S2S-FRM-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = \`S2S-FRM-\${String(nextNum).padStart(6, '0')}\`;
    } else if (role === "PROCESSOR") {
      const lastUser = await User.findOne({ role: "PROCESSOR", roleId: { $exists: true, $ne: "PENDING" } }).sort({ roleId: -1 });
      let nextNum = 1;
      if (lastUser && lastUser.roleId) {
        const match = lastUser.roleId.match(/S2S-PRC-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = \`S2S-PRC-\${String(nextNum).padStart(6, '0')}\`;
    } else if (role === "ADMIN") {
      const lastUser = await User.findOne({ role: "ADMIN", roleId: { $exists: true, $ne: "PENDING" } }).sort({ roleId: -1 });
      let nextNum = 1;
      if (lastUser && lastUser.roleId) {
        const match = lastUser.roleId.match(/S2S-ADM-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = \`S2S-ADM-\${String(nextNum).padStart(6, '0')}\`;
    } else if (role === "DISTRIBUTOR") {
      const lastUser = await User.findOne({ role: "DISTRIBUTOR", roleId: { $exists: true, $ne: "PENDING" } }).sort({ roleId: -1 });
      let nextNum = 1;
      if (lastUser && lastUser.roleId) {
        const match = lastUser.roleId.match(/S2S-DST-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = \`S2S-DST-\${String(nextNum).padStart(6, '0')}\`;
    } else if (role === "RETAILER") {
      const lastUser = await User.findOne({ role: "RETAILER", roleId: { $exists: true, $ne: "PENDING" } }).sort({ roleId: -1 });
      let nextNum = 1;
      if (lastUser && lastUser.roleId) {
        const match = lastUser.roleId.match(/S2S-RET-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = \`S2S-RET-\${String(nextNum).padStart(6, '0')}\`;
    } else if (role === "CUSTOMER") {
      const lastUser = await User.findOne({ role: "CUSTOMER", roleId: { $exists: true, $ne: "PENDING" } }).sort({ roleId: -1 });
      let nextNum = 1;
      if (lastUser && lastUser.roleId) {
        const match = lastUser.roleId.match(/S2S-CUS-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      roleId = \`S2S-CUS-\${String(nextNum).padStart(6, '0')}\`;
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      roleId
    });

    const roleDoc = await Role.create({
      _id: roleId,
      userId: user._id,
      role: role
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
      user: { id: user._id, name: user.name, role: user.role, email: user.email, roleId: user.roleId, roleDetails: roleDoc }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
`;

content = content.replace(/router\.post\('\/signup', async \(req, res\) => \{[\s\S]*?(?=\/\/ LOGIN)/, newSignup + '\n');

// Replace login
const newLogin = `
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

    let roleDoc = {};
    if (user.roleId) {
      roleDoc = await Role.findById(user.roleId) || {};
    }

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
        name: user.name,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        roleDetails: roleDoc
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
`;

content = content.replace(/router\.post\('\/login', async \(req, res\) => \{[\s\S]*?(?=module\.exports = router;)/, newLogin + '\n');

fs.writeFileSync('routes/auth.js', content, 'utf8');
