import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = Router();

router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/all", protect, adminOnly, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;
