import api from "./axios";

export const getProducts = async (params = {}) => {
  return await api.get("/products", { params });
};

export const getProduct = async (id) => {
  return await api.get(`/products/${id}`);
};
