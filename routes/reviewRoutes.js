import express from "express";
import { getReviewsByProperty, updateReviewStatus } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/:propertyId/reviews", getReviewsByProperty);
router.put("/:id/approve", updateReviewStatus);


export default router;
