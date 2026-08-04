import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";

import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";

const router = express.Router();

router.get("/", protect, adminOnly, getSettings);

router.put("/", protect, adminOnly, updateSettings);

export default router;
