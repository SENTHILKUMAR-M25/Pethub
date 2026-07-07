import api from "../api/axios";

// Get Categories
export const getCategories = async () => {
  return await api.get("/categories");
};

// Create Category
export const createCategory = async (formData) => {
  return await api.post("/categories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Update Category
export const updateCategory = async (id, formData) => {
  return await api.put(`/categories/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete Category
export const deleteCategory = async (id) => {
  return await api.delete(`/categories/${id}`);
};