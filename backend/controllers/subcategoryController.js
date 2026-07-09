import mongoose from "mongoose";
import Subcategory from "../models/Subcategory.js";
import slugify from "slugify";

export const createSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.create({
      name: req.body.name,
      slug: slugify(req.body.name),
      category: req.body.category,
      description: req.body.description,
      status: req.body.status,

      image: req.file
        ? `/uploads/subcategories/${req.file.filename}`
        : "",
    });

    const populated = await subcategory.populate("category", "name");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      slug: slugify(req.body.name),
      category: req.body.category,
      description: req.body.description,
      status: req.body.status,
    };

    if (req.file) {
      data.image = `/uploads/subcategories/${req.file.filename}`;
    }

    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    ).populate("category", "name");

    res.json(subcategory);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSubcategories = async (req, res) => {
  const pipeline = [
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "subcategory",
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
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
    },
  ];

  if (req.query.category) {
    pipeline.unshift({
      $match: { category: new mongoose.Types.ObjectId(req.query.category) },
    });
  }

  const subcategories = await Subcategory.aggregate(pipeline);

  res.json(subcategories);
};

export const getSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  await Subcategory.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
  });
};
