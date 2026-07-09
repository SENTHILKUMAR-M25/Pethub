import { Router } from "express";
import { register, login, getMe, updateProfile, logout } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.post("/logout", logout);

export default router;
