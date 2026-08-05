import api from "./axios";

export const validateCoupon = (code, subtotal, shippingCost) =>
  api.post("/coupons/validate", { code, subtotal, shippingCost });

export const getAvailableCoupons = () => api.get("/coupons/available");
