import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  mergeCart,
  clearCart,
} from "../controllers/cartController.js";

const router = Router();

router.get("/", protect, getCart);
router.post("/add", protect, addItem);
router.put("/update", protect, updateQuantity);
router.delete("/remove/:productId", protect, removeItem);
router.post("/merge", protect, mergeCart);
router.delete("/clear", protect, clearCart);

export default router;
