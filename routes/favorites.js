const express = require("express");
const { getFavorites, toggleFavorite, clearFavorites } = require("../controllers/favoritesController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getFavorites);
router.post("/", protect, toggleFavorite);
router.delete("/", protect, clearFavorites);

module.exports = router;