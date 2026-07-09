import api from "./axios";

export const getCategories = async () => {
  return await api.get("/categories");
};
