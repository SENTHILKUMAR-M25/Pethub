import api from "./axios";

export const fetchCart = () => api.get("/cart");
export const addToCart = (productId, quantity = 1) => api.post("/cart/add", { productId, quantity });
export const updateCartQuantity = (productId, quantity) => api.put("/cart/update", { productId, quantity });
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const mergeCart = (items) => api.post("/cart/merge", { items });
export const clearCartOnServer = () => api.delete("/cart/clear");
