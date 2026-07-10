const Post = require("../models/Post");

// GET /posts/public
// Returns only posts with isPublic=true
const getPublicPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true }).populate("owner", "username role");
    res.json(posts);
  } catch (error) {
    console.error("getPublicPosts error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /posts
// Creates a post with owner=req.user._id
const createPost = async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Please provide title and content" });
    }

    const post = await Post.create({
      title,
      content,
      isPublic: isPublic !== undefined ? isPublic : true,
      owner: req.user._id,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("createPost error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /posts/me
// Returns only the current user's posts
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ owner: req.user._id }).populate("owner", "username role");
    res.json(posts);
  } catch (error) {
    console.error("getMyPosts error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /posts/:id
// Admin can update any post. User can only update their own post.
const updatePost = async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Role and ownership check
    if (req.user.role !== "admin") {
      if (post.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Sizga ruxsat yo'q (owner emas)" });
      }
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (isPublic !== undefined) post.isPublic = isPublic;

    await post.save();
    res.json(post);
  } catch (error) {
    console.error("updatePost error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /posts/:id
// Admin can delete any post. User can only delete their own post.
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Role and ownership check
    if (req.user.role !== "admin") {
      if (post.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Sizga ruxsat yo'q (owner emas)" });
      }
    }

    await Post.deleteOne({ _id: post._id });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("deletePost error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /posts (Admin Only)
// Returns all posts for the admin panel
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("owner", "username role");
    res.json(posts);
  } catch (error) {
    console.error("getAllPosts error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /posts/:id/toggle-public (Admin Only)
// Toggles isPublic field between true and false
const togglePublic = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.isPublic = !post.isPublic;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("togglePublic error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getPublicPosts,
  createPost,
  getMyPosts,
  updatePost,
  deletePost,
  getAllPosts,
  togglePublic,
};
