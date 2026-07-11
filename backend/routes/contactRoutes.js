import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  submitContact,
  getAllContacts,
  getContact,
  deleteContact,
  markAsRead,
} from "../controllers/contactController.js";

const router = Router();

router.post("/", submitContact);
router.get("/", protect, adminOnly, getAllContacts);
router.get("/:id", protect, adminOnly, getContact);
router.delete("/:id", protect, adminOnly, deleteContact);
router.patch("/:id/read", protect, adminOnly, markAsRead);

export default router;
