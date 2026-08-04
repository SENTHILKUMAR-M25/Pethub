import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import upload from "../config/multerBanner.js";

import {
  createBanner,
  getBanners,
  getActiveBanners,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";

const router = express.Router();

router.post("/", protect, adminOnly, upload.single("image"), createBanner);

router.get("/", getBanners);

router.get("/active", getActiveBanners);

router.put("/:id", protect, adminOnly, upload.single("image"), updateBanner);

router.delete("/:id", protect, adminOnly, deleteBanner);

export default router;
