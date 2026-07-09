import api from "./axios";

export const createOrder = (data) => api.post("/orders", data);
export const getMyOrders = () => api.get("/orders");
export const getOrderById = (id) => api.get(`/orders/${id}`);

export const getAllOrders = (params) => api.get("/orders/all", { params });
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
