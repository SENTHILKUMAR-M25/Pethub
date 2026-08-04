import Coupon from "../models/Coupon.js";

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      value,
      minOrder,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      status,
    } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    if (!normalizedCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      description,
      type,
      value,
      minOrder,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      status,
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error("Create coupon error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      value,
      minOrder,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      status,
    } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    if (!normalizedCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const existing = await Coupon.findOne({
      code: normalizedCode,
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: normalizedCode,
        description,
        type,
        value,
        minOrder,
        maxDiscount,
        usageLimit,
        startDate,
        endDate,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(coupon);
  } catch (error) {
    console.error("Update coupon error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const findValidCoupon = async (code, subtotal) => {
  const normalizedCode = String(code || "").trim().toUpperCase();

  if (!normalizedCode) {
    return { valid: false, message: "Please enter a coupon code" };
  }

  const coupon = await Coupon.findOne({ code: normalizedCode });

  if (!coupon) {
    return { valid: false, message: "Invalid coupon code" };
  }

  if (coupon.status !== "Active") {
    return { valid: false, message: "This coupon is currently inactive" };
  }

  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, message: "Coupon is not active yet" };
  }
  if (coupon.endDate) {
    const endOfDay = new Date(coupon.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    if (endOfDay < now) {
      return { valid: false, message: "Coupon has expired" };
    }
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: "Coupon usage limit reached" };
  }
  if (coupon.minOrder > 0 && subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `Minimum order of ₹${coupon.minOrder} required`,
    };
  }

  return { valid: true, coupon };
};

export const computeCouponDiscount = (coupon, subtotal, shippingCost = 0) => {
  let discount = 0;
  if (coupon.type === "percent") {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else if (coupon.type === "flat") {
    discount = coupon.value;
  } else if (coupon.type === "freeship") {
    discount = shippingCost || 0;
  }
  return Math.min(discount, Math.max(subtotal, 0));
};

export const markCouponUsed = async (couponId) => {
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
};

export const decrementCouponUsed = async (couponId) => {
  await Coupon.findOneAndUpdate(
    { _id: couponId, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } }
  );
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal, shippingCost } = req.body;
    const result = await findValidCoupon(code, subtotal || 0);

    if (!result.valid) {
      return res.status(400).json({ message: result.message });
    }

    const coupon = result.coupon;
    const discount = computeCouponDiscount(coupon, subtotal || 0, shippingCost || 0);

    res.json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        discount,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({ message: error.message });
  }
};
