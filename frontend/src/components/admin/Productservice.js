import api from "../../api/axios";

export const getProducts = async () => {
  return await api.get("/products");
};

export const getProduct = async (id) => {
  return await api.get(`/products/${id}`);
};

export const createProduct = async (formData) => {
  return await api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProduct = async (id, formData) => {
  return await api.put(`/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProduct = async (id) => {
  return await api.delete(`/products/${id}`);
};
