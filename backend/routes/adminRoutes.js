import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/adminController.js";

const router = Router();

router.get("/dashboard", protect, adminOnly, getDashboardStats);

export default router;
