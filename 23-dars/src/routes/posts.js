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

router.get("/posts/public", getPublicPosts);

router.post("/posts", requireAuth, createPost);
router.get("/posts/me", requireAuth, getMyPosts);
router.put("/posts/:id", requireAuth, updatePost);
router.delete("/posts/:id", requireAuth, deletePost);

router.get("/posts", requireAuth, requireRole("admin"), getAllPosts);
router.patch("/posts/:id/toggle-public", requireAuth, requireRole("admin"), togglePublic);

module.exports = router;
