const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 Generate Admin Token
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// 📝 REGISTER ADMIN
exports.registerAdmin = async (req, res) => {
  try {
    const { name, messName, email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      messName,
      email,
      password: hashedPassword
    });

    res.json({
      success: true,
      message: "Admin account created successfully"
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔑 LOGIN ADMIN (email OR name)
exports.loginAdmin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { name: identifier }]
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      token,
      admin: {
        name: admin.name,
        email: admin.email,
        messName: admin.messName
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
