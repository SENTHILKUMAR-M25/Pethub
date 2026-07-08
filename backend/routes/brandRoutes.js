import express from "express";
import upload from "../config/multerBrand.js";

import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";

const router = express.Router();

router.post("/", upload.single("image"), createBrand);

router.get("/", getBrands);

router.put("/:id", upload.single("image"), updateBrand);

router.delete("/:id", deleteBrand);

export default router;
