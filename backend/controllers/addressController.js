import Address from "../models/Address.js";

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const { label, street, city, state, zip, country } = req.body;
    if (!street || !city || !state || !zip) {
      return res.status(400).json({ message: "Street, city, state, and zip are required" });
    }
    const address = await Address.create({
      user: req.user._id,
      label: label || "Home",
      street,
      city,
      state,
      zip,
      country: country || "United States",
    });
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    const { label, street, city, state, zip, country } = req.body;
    if (label !== undefined) address.label = label;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (zip !== undefined) address.zip = zip;
    if (country !== undefined) address.country = country;
    await address.save();
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
