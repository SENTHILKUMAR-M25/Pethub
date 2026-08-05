import api from "./axios";

export const getActiveBanners = () => api.get("/banners/active");
