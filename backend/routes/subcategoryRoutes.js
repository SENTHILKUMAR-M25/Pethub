import express from "express";
import upload from "../config/multerSubcategory.js";

import {
  createSubcategory,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategoryController.js";

const router = express.Router();

router.post("/", upload.single("image"), createSubcategory);

router.get("/", getSubcategories);

router.get("/:id", getSubcategory);

router.put("/:id", upload.single("image"), updateSubcategory);

router.delete("/:id", deleteSubcategory);

export default router;
