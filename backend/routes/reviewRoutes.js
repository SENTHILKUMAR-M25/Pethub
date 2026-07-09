import { Router } from "express";
import { protect, adminOnly, optionalAuth } from "../middleware/auth.js";
import {
  createReview,
  getProductReviews,
  canReview,
  deleteReview,
  getAllReviews,
} from "../controllers/reviewController.js";

const router = Router();

router.get("/product/:productId", getProductReviews);
router.get("/can-review/:productId", optionalAuth, canReview);
router.post("/", protect, createReview);
router.delete("/:id", protect, deleteReview);
router.get("/", protect, adminOnly, getAllReviews);

export default router;
