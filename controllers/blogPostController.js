  const cloudinary = require('cloudinary').v2;
  const Blog = require('../models/BlogPost');
  const slugify = require('slugify');
  const fs = require('fs');
  const path = require("path");

  //  Configure Cloudinary (use your .env values)
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });


  // create post
  exports.createPost = async (req, res) => {
    try {
      const { title, content, excerpt, author, tags, published } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      // CloudinaryStorage already uploads the image, so get the URL directly
      const featureImageUrl = req.file ? req.file.path : "";

      // Generate unique slug
      const baseSlug = slugify(title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (await Blog.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      const post = await Blog.create({
        title,
        slug,
        content,
        excerpt,
        author,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        featureImage: featureImageUrl,
        published,
      });

      res.status(201).json({ success: true, data: post });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Server error" });
    }
  };


  exports.updatePost = async (req, res) => {
    try {
      const post = await Blog.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });
  
      //  If a new image was uploaded (multer-storage-cloudinary gives Cloudinary URL)
      if (req.file && req.file.path) {
        //  Delete old image from Cloudinary (if exists)
        if (post.featureImage && post.featureImage.includes("cloudinary.com")) {
          try {
            const publicId = post.featureImage.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`blog_images/${publicId}`);
          } catch (err) {
            console.warn("⚠️ Failed to delete old Cloudinary image:", err.message);
          }
        }
  
        //  Replace with new Cloudinary URL
        post.featureImage = req.file.path;
      }
  
      //  Update other fields
      post.title = req.body.title || post.title;
      post.content = req.body.content || post.content;
      post.excerpt = req.body.excerpt || post.excerpt;
      post.author = req.body.author || post.author;
      post.tags = req.body.tags
        ? req.body.tags.split(",").map((t) => t.trim())
        : post.tags;
      post.slug = slugify(post.title, { lower: true });
  
      await post.save();
  
      res.json({ success: true, message: "Post updated successfully", post });
    } catch (error) {
      console.error("❌ Error updating post:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  

  //  Delete Post
  exports.deletePost = async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Blog.findById(id);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      // If post has a Cloudinary image, delete it
      if (post.featureImage) {
        const publicId = post.featureImage.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`blog_images/${publicId}`);
        } catch (err) {
          console.warn('Failed to delete Cloudinary image:', err.message);
        }
      }

      await Blog.findByIdAndDelete(id);

      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  //  Duplicate Post
  exports.duplicatePost = async (req, res) => {
    try {
      const { id } = req.params;

      // Find original post
      const original = await Blog.findById(id);
      if (!original) return res.status(404).json({ error: 'Post not found' });

      // Prepare duplicated data
      const baseSlug = slugify(original.title + ' Copy', { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      while (await Blog.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      let newFeatureImage = original.featureImage;

      //  Optional: Duplicate Cloudinary image (create a new copy)
      if (original.featureImage) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(original.featureImage, {
            folder: 'blog_images',
          });
          newFeatureImage = uploadResponse.secure_url;
        } catch (err) {
          console.warn('Failed to duplicate Cloudinary image:', err.message);
        }
      }

      const duplicate = await Blog.create({
        title: original.title + ' Copy',
        slug,
        content: original.content,
        excerpt: original.excerpt,
        author: original.author,
        tags: original.tags,
        featureImage: newFeatureImage, //  Duplicate image URL
        published: original.published,
      });

      res.status(201).json({ success: true, data: duplicate });
    } catch (error) {
      console.error('Error duplicating post:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  //  Get All Posts
  exports.getPosts = async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1'));
      const limit = Math.min(50, parseInt(req.query.limit || '10'));
      const skip = (page - 1) * limit;
  
      const posts = await Blog.find({ published: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug excerpt author createdAt tags featureImage');
  
      const total = await Blog.countDocuments({ published: true });
  
      res.json({ data: posts, meta: { page, limit, total } });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };


  //  Get Single Post by MongoDB ID
  exports.getPostById = async (req, res) => {
    try {
      const post = await Blog.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ success: true, data: post });
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  //  Get Single Post by Slug
  exports.getPostBySlug = async (req, res) => {
    try {
      const post = await Blog.findOne({ slug: req.params.slug });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json({ success: true, data: post });
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };


