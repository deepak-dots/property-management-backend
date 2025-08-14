// controllers/propertyController.js
const fs = require('fs');
const path = require('path');
const Property = require('../models/Property');

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
      transactionType,
      limit: limitQuery,
      page: pageQuery,
    } = req.query;

    const limit = parseInt(limitQuery) || 9;
    const page = parseInt(pageQuery) || 1;

    const filter = {};

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (city) filter.city = city;
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

exports.createProperty = async (req, res) => {
  try {
    const {
      title, bhkType, furnishing, bedrooms, bathrooms, superBuiltupArea, developer, project,
      transactionType, status, price, reraId, address, description, city, activeStatus
    } = req.body;

    const images = req.files ? req.files.map(file => file.filename) : [];

    const newProperty = new Property({
      title,
      bhkType,
      furnishing,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      superBuiltupArea,
      developer,
      project,
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



exports.updateProperty = async (req, res) => {
  try {
    const {
      title, bhkType, furnishing, bedrooms, bathrooms, superBuiltupArea,
      developer, project, transactionType, status, price, reraId, address,
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

    // Delete removed images from disk
    removedImgs.forEach(img => {
      const filePath = path.join(__dirname, '..', 'uploads', img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // Filter out removed images from current images
    let updatedImages = property.images.filter(img => !removedImgs.includes(img));

    // Append newly uploaded files
    if (req.files && req.files.length > 0) {
      updatedImages = updatedImages.concat(req.files.map(f => f.filename));
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


exports.duplicateProperty = async (req, res) => {
  try {
    const original = await Property.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Property not found' });

    const duplicateData = {
      ...original.toObject(),
      _id: undefined,
      title: original.title + ' (Copy)',
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

exports.deleteProperty = async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

exports.getRelatedProperties = async (req, res) => {
  try {
    const currentProperty = await Property.findById(req.params.id);
    if (!currentProperty) return res.status(404).json({ message: 'Property not found' });

    const related = await Property.find({
      _id: { $ne: currentProperty._id },
    }).limit(3);

    res.json(related);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching related properties' });
  }
};
