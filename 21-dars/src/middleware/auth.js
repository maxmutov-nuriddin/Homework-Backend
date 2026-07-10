const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      const user = await User.findById(decoded.userId).select("-passwordHash");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Not authorized, token invalid or expired" });
    }
  } else {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
