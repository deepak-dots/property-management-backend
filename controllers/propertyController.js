// const fs = require('fs');
// const path = require('path');
const Property = require('../models/Property');

// Cloudinary setup
const { v2: cloudinary } = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Get all properties with search and filters
exports.getProperties = async (req, res) => {
  try {
    const {
      search,
      city,
      bhkType,
      furnishing,
      status,
      priceMin,
      priceMax,
      propertyType,
      transactionType,
      limit: limitQuery,
      page: pageQuery,
    } = req.query;

    const limit = parseInt(limitQuery) || 9;
    const page = parseInt(pageQuery) || 1;

    const filter = {};

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (city) filter.city = city;
    if (propertyType) filter.propertyType = propertyType;
    if (bhkType) filter.bhkType = bhkType;
    if (furnishing) filter.furnishing = furnishing;
    if (status) filter.status = status;
    if (transactionType) filter.transactionType = transactionType;
    if (priceMin) filter.price = { ...filter.price, $gte: Number(priceMin) };
    if (priceMax) filter.price = { ...filter.price, $lte: Number(priceMax) };

    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      properties,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// -------------------- CREATE PROPERTY --------------------
exports.createProperty = async (req, res) => {
  try {
    const {
      title, bhkType, furnishing, bedrooms, bathrooms, superBuiltupArea, developer, project, propertyType,
      transactionType, status, price, reraId, address, description, city, activeStatus
    } = req.body;

    // OLD CODE (local disk save)
    // const images = req.files ? req.files.map(file => file.filename) : [];

    // NEW CODE (Cloudinary URLs)
    const images = req.files ? req.files.map(file => file.path) : [];

    const newProperty = new Property({
      title,
      bhkType,
      furnishing,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      superBuiltupArea,
      developer,
      project,
      propertyType,
      transactionType,
      status,
      price: price ? Number(price) : undefined,
      reraId,
      address,
      description,
      city,
      activeStatus: activeStatus || 'Draft',
      images
    });

    const savedProperty = await newProperty.save();
    res.status(201).json({ message: 'Property created!', property: savedProperty });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create property', error: err.message });
  }
};

// -------------------- UPDATE PROPERTY --------------------
exports.updateProperty = async (req, res) => {
  try {
    const {
      title, bhkType, furnishing, bedrooms, bathrooms, superBuiltupArea,
      developer, project, transactionType, propertyType, status, price, reraId, address,
      description, city, activeStatus, existingImages, removedImages
    } = req.body;

    // Parse JSON if sent as strings
    const existingImgs = existingImages
      ? (typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages)
      : [];
    const removedImgs = removedImages
      ? (typeof removedImages === 'string' ? JSON.parse(removedImages) : removedImages)
      : [];

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // OLD CODE (delete local files)
    /*
    removedImgs.forEach(img => {
      const filePath = path.join(__dirname, '..', 'uploads', img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    */

    // NEW CODE (optional: delete from Cloudinary if needed)
    for (let img of removedImgs) {
      try {
        const urlParts = img.split('/');
        const last = urlParts[urlParts.length - 1]; // e.g. abcdef.jpg
        const publicId = last.includes('.') ? last.substring(0, last.lastIndexOf('.')) : last;
        await cloudinary.uploader.destroy("property-images/" + publicId);
      } catch (e) {
        console.log("Cloudinary delete failed:", e.message);
      }
    }

    // Filter out removed images from current images
    let updatedImages = property.images.filter(img => !removedImgs.includes(img));

    // Append newly uploaded files
    if (req.files && req.files.length > 0) {
      updatedImages = updatedImages.concat(req.files.map(f => f.path)); // Cloudinary URL
    }

    // Build update object
    const updatedData = {
      title,
      bhkType,
      furnishing,
      bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
      bathrooms: bathrooms !== undefined ? Number(bathrooms) : undefined,
      superBuiltupArea,
      developer,
      project,
      propertyType,
      transactionType,
      status,
      price: price !== undefined ? Number(price) : undefined,
      reraId,
      address,
      description,
      city,
      activeStatus,
      images: updatedImages,
    };

    // Remove undefined fields
    Object.keys(updatedData).forEach(key => updatedData[key] === undefined && delete updatedData[key]);

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    res.status(200).json(updatedProperty);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// -------------------- DUPLICATE PROPERTY --------------------
exports.duplicateProperty = async (req, res) => {
  try {
    const original = await Property.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Property not found' });

    const duplicateData = {
      ...original.toObject(),
      _id: undefined,
      title: (original.title || 'Property') + ' (Copy)',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const duplicate = new Property(duplicateData);
    await duplicate.save();

    res.status(201).json(duplicate);
  } catch (err) {
    res.status(500).json({ message: 'Failed to duplicate property' });
  }
};

// -------------------- DELETE PROPERTY --------------------
exports.deleteProperty = async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Property not found' });

    // Optional: delete its images from Cloudinary
    if (deleted.images && deleted.images.length) {
      for (let img of deleted.images) {
        try {
          const urlParts = img.split('/');
          const last = urlParts[urlParts.length - 1];
          const publicId = last.includes('.') ? last.substring(0, last.lastIndexOf('.')) : last;
          await cloudinary.uploader.destroy("property-images/" + publicId);
        } catch (e) {
          console.log("Cloudinary delete failed:", e.message);
        }
      }
    }

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

// -------------------- RELATED PROPERTIES --------------------
exports.getRelatedProperties = async (req, res) => {
  try {
    const currentProperty = await Property.findById(req.params.id);
    if (!currentProperty) return res.status(404).json({ message: 'Property not found' });

    const related = await Property.find({
      _id: { $ne: currentProperty._id },
      city: currentProperty.city, // simple relation by city
    }).limit(3);

    res.json(related);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching related properties' });
  }
};
