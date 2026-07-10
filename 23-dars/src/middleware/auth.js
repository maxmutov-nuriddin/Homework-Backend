const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || "supersecret_access_key_homework_22"
      );
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      req.user = {
        username: user.username,
        role: user.role,
        _id: user._id,
      };
      next();
    } catch (error) {
      return res.status(401).json({ error: "Not authorized, token invalid or expired" });
    }
  } else {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
