import Product from "../models/Product.js";
import slugify from "slugify";

export const createProduct = async (req, res) => {
  try {
    const images = req.files
      ? req.files.map((f) => `/uploads/products/${f.filename}`)
      : [];

    const product = await Product.create({
      name: req.body.name,
      slug: slugify(req.body.name),
      category: req.body.category,
      subcategory: req.body.subcategory || undefined,
      brand: req.body.brand || undefined,
      price: req.body.price,
      originalPrice: req.body.originalPrice || undefined,
      description: req.body.description,
      images,
      stock: req.body.stock,
      tag: req.body.tag || "",
      status: req.body.status,
      featured: req.body.featured === "true" || req.body.featured === true,
    });

    const populated = await Product.findById(product._id)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      slug: slugify(req.body.name),
      category: req.body.category,
      subcategory: req.body.subcategory || undefined,
      brand: req.body.brand || undefined,
      price: req.body.price,
      originalPrice: req.body.originalPrice || undefined,
      description: req.body.description,
      stock: req.body.stock,
      tag: req.body.tag || "",
      status: req.body.status,
      featured: req.body.featured === "true" || req.body.featured === true,
    };

    if (req.files && req.files.length > 0) {
      const images = req.files.map(
        (f) => `/uploads/products/${f.filename}`
      );
      data.images = images;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    )
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name");

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  const filter = {};
  if (req.query.featured === "true") {
    filter.featured = true;
  }

  const products = await Product.find(filter)
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .sort({ createdAt: -1 });

  res.json(products);
};

export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name");

  res.json(product);
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
  });
};
