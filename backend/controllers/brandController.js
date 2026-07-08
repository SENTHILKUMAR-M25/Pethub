import Brand from "../models/Brand.js";
import slugify from "slugify";

export const createBrand = async (req, res) => {
  try {
    const brand = await Brand.create({
      name: req.body.name,
      slug: slugify(req.body.name),
      description: req.body.description,
      status: req.body.status,

      image: req.file
        ? `/uploads/brands/${req.file.filename}`
        : "",
    });

    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      slug: slugify(req.body.name),
      description: req.body.description,
      status: req.body.status,
    };

    if (req.file) {
      data.image = `/uploads/brands/${req.file.filename}`;
    }

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    res.json(brand);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getBrands = async (req, res) => {
  const brands = await Brand.find();

  res.json(brands);
};

export const deleteBrand = async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
  });
};
