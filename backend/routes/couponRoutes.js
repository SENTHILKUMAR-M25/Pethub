import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";

import {
  createCoupon,
  getCoupons,
  getAvailableCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

router.post("/", protect, adminOnly, createCoupon);

router.get("/", protect, adminOnly, getCoupons);

router.get("/available", getAvailableCoupons);

router.post("/validate", validateCoupon);

router.put("/:id", protect, adminOnly, updateCoupon);

router.delete("/:id", protect, adminOnly, deleteCoupon);

export default router;
