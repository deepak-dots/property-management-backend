import Review from "../models/Review.js";
import Property from "../models/Property.js";

export const getReviewsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // ✅ Find only approved reviews
    const reviews = await Review.find({ property: propertyId, approved: true }).sort({ createdAt: -1 });

    // Get property name
    const property = await Property.findById(propertyId).select("title");

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    res.status(200).json({
      propertyName: property?.title || "Unknown Property",
      reviews,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching property reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const updateReviewStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { approved } = req.body;
  
      const review = await Review.findByIdAndUpdate(id, { approved }, { new: true });
      if (!review) return res.status(404).json({ message: "Review not found" });
  
      res.json({ message: "Review updated successfully", review });
    } catch (error) {
      res.status(500).json({ message: "Failed to update review" });
    }
  };
  
