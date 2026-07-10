const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  getPublicPosts,
  createPost,
  getMyPosts,
  updatePost,
  deletePost,
  getAllPosts,
  togglePublic,
} = require("../controllers/postController");

// PUBLIC
router.get("/posts/public", getPublicPosts);

// AUTH REQUIRED
router.post("/posts", requireAuth, createPost);
router.get("/posts/me", requireAuth, getMyPosts);
router.put("/posts/:id", requireAuth, updatePost);
router.delete("/posts/:id", requireAuth, deletePost);

// ADMIN ONLY
router.get("/posts", requireAuth, requireRole("admin"), getAllPosts);
router.patch("/posts/:id/toggle-public", requireAuth, requireRole("admin"), togglePublic);

module.exports = router;
