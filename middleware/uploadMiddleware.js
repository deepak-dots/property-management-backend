// middleware/uploadMiddleware.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// For property images
const propertyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "properties",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage: propertyStorage });

// For blog images
const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const blogUpload = multer({ storage: blogStorage });

module.exports = { cloudinary, upload, blogUpload };



