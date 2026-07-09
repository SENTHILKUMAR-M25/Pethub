import express from "express";
import upload from "../config/multerProduct.js";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/", upload.array("images", 5), createProduct);

router.get("/", getProducts);

router.get("/:id", getProduct);

router.put("/:id", upload.array("images", 5), updateProduct);

router.delete("/:id", deleteProduct);

export default router;
