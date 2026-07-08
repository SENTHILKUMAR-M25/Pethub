import api from "../../api/axios";

export const getSubcategories = async () => {
  return await api.get("/subcategories");
};

export const getSubcategoriesByCategory = async (categoryId) => {
  return await api.get(`/subcategories?category=${categoryId}`);
};

export const createSubcategory = async (formData) => {
  return await api.post("/subcategories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateSubcategory = async (id, formData) => {
  return await api.put(`/subcategories/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteSubcategory = async (id) => {
  return await api.delete(`/subcategories/${id}`);
};
