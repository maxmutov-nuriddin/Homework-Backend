const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Helper to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    process.env.JWT_ACCESS_SECRET || "supersecret_access_key_homework_22",
    { expiresIn: "1h" }
  );
};

// POST /auth/register
const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Please provide username and password" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this username" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      passwordHash,
      role: role || "user",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Please provide username and password" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
};
