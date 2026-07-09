import Category from "../models/Category.js";
import slugify from "slugify";

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      name: req.body.name,
      slug: slugify(req.body.name),
      description: req.body.description,
      status: req.body.status,

      image: req.file
        ? `/uploads/categories/${req.file.filename}`
        : "",
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      slug: slugify(req.body.name),
      description: req.body.description,
      status: req.body.status,
    };

    if (req.file) {
      data.image = `/uploads/categories/${req.file.filename}`;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    res.json(category);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "category",
        as: "products",
      },
    },
    {
      $addFields: {
        productCount: { $size: "$products" },
      },
    },
    {
      $project: { products: 0 },
    },
  ]);

  res.json(categories);
};



export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
  });
};