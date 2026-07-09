import api from "./axios";

export const getBrands = async () => {
  return await api.get("/brands");
};
