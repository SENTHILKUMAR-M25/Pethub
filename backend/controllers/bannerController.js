import Banner from "../models/Banner.js";

export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create({
      title: req.body.title,
      subtitle: req.body.subtitle,
      link: req.body.link,
      position: req.body.position,
      order: req.body.order,
      status: req.body.status,
      image: req.file ? `/uploads/banners/${req.file.filename}` : "",
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error("Create banner error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error("Get banners error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ status: "Active" })
      .sort({ order: 1, createdAt: -1 })
      .limit(6);
    res.json(banners);
  } catch (error) {
    console.error("Get active banners error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      link: req.body.link,
      position: req.body.position,
      order: req.body.order,
      status: req.body.status,
    };

    if (req.file) {
      data.image = `/uploads/banners/${req.file.filename}`;
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json(banner);
  } catch (error) {
    console.error("Update banner error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({ message: error.message });
  }
};
