// routes/blogPosts.js
const express = require("express");
const router = express.Router();
const { blogUpload } = require("../middleware/uploadMiddleware");

const {
  createPost,
  getPosts,
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
  duplicatePost,
} = require("../controllers/blogPostController");

// Routes
router.post("/", blogUpload.single("featureImage"), createPost);
router.put("/:id", blogUpload.single("featureImage"), updatePost);

router.get("/", getPosts);
router.get("/id/:id", getPostById);
router.get("/:slug", getPostBySlug);
router.delete("/:id", deletePost);
router.post("/duplicate/:id", duplicatePost);

module.exports = router;
