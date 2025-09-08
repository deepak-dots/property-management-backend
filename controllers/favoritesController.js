const User = require("../models/User");

// Get all favorites
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Toggle favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: "Property ID required" });

    const user = await User.findById(req.user.id);

    if (user.favorites.includes(propertyId)) {
      user.favorites = user.favorites.filter(fav => fav.toString() !== propertyId);
    } else {
      user.favorites.push(propertyId);
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate("favorites");
    res.json(updatedUser.favorites);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Clear all favorites
exports.clearFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = [];
    await user.save();
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
