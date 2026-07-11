const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RefreshSession = require("../models/RefreshSession");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET || "supersecret_access_key_987654321", {
    expiresIn: "15m",
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide name, email and password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, deviceName } = req.body;

    if (!email || !password || !deviceName) {
      return res.status(400).json({ error: "Please provide email, password and deviceName" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);

    const refreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshSession.create({
      userId: user._id,
      refreshTokenHash,
      deviceName,
      ip: req.ip || null,
      expiresAt,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    const refreshTokenHash = hashToken(refreshToken);

    const session = await RefreshSession.findOne({
      refreshTokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const newRefreshToken = crypto.randomBytes(40).toString("hex");
    const newRefreshTokenHash = hashToken(newRefreshToken);

    session.revokedAt = new Date();
    await session.save();

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshSession.create({
      userId: session.userId,
      refreshTokenHash: newRefreshTokenHash,
      deviceName: session.deviceName,
      ip: req.ip || null,
      expiresAt,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const newAccessToken = generateAccessToken(session.userId);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const refreshTokenHash = hashToken(refreshToken);
      
      await RefreshSession.updateOne(
        { refreshTokenHash, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Successfully logged out" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
