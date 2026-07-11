const express = require("express");
const router = express.Router();
const { register, login, refresh, logout, getMe } = require("../controllers/authController");
const { getSessions, revokeSession } = require("../controllers/sessionController");
const { protect } = require("../middleware/auth");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", logout);

router.get("/me", protect, getMe);
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:id", protect, revokeSession);

module.exports = router;
