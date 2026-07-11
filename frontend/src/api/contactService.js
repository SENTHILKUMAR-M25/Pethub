import api from "./axios";

export const submitContact = (data) => api.post("/contact", data);
export const getAllContacts = () => api.get("/contact");
export const getContact = (id) => api.get(`/contact/${id}`);
export const deleteContact = (id) => api.delete(`/contact/${id}`);
export const markAsRead = (id) => api.patch(`/contact/${id}/read`);
