import api from "./axios";

export const getProductReviews = (productId) => api.get(`/reviews/product/${productId}`);
export const canReview = (productId) => api.get(`/reviews/can-review/${productId}`);
export const createReview = (data) => api.post("/reviews", data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
export const getAllReviews = (params) => api.get("/reviews", { params });
