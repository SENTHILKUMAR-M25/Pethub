import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Jod PetHub" },
    storeTagline: { type: String, default: "" },
    supportEmail: { type: String, default: "" },
    supportPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    shippingCost: { type: Number, default: 5.99 },
    freeShippingThreshold: { type: Number, default: 0 },
    announcement: { type: String, default: "" },
    announcementEnabled: { type: Boolean, default: false },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export async function getSettings() {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  return settings;
}

const Setting = mongoose.model("Setting", settingSchema);

export default Setting;
