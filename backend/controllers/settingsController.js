import Setting, { getSettings as getOrCreateSettings } from "../models/Setting.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    const allowedFields = [
      "storeName",
      "storeTagline",
      "supportEmail",
      "supportPhone",
      "address",
      "currency",
      "shippingCost",
      "freeShippingThreshold",
      "announcement",
      "announcementEnabled",
      "socialLinks",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: error.message });
  }
};
