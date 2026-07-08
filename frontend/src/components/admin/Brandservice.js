import api from "../../api/axios";

export const getBrands = async () => {
  return await api.get("/brands");
};

export const createBrand = async (formData) => {
  return await api.post("/brands", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateBrand = async (id, formData) => {
  return await api.put(`/brands/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteBrand = async (id) => {
  return await api.delete(`/brands/${id}`);
};
