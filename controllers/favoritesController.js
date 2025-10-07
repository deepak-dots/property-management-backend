// controllers/favoritesController.js 
const User = require('../models/User');

const getFavorites = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { propertyId } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!propertyId) return res.status(400).json({ message: 'Property ID required' });

    const user = await User.findById(userId);
    const index = user.favorites.findIndex(f => f.toString() === propertyId);

    if (index > -1) user.favorites.splice(index, 1);
    else user.favorites.push(propertyId);

    await user.save();
    const updatedUser = await User.findById(userId).populate('favorites');
    res.json(updatedUser.favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const clearFavorites = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    user.favorites = [];
    await user.save();
    res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFavorites, toggleFavorite, clearFavorites };
