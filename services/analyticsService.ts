import axios from "@/lib/axios";
import { AnalyticsResponse } from "@/types/analytics";

// Analytics Services
export const getAnalytics = () => {
  return axios.get<AnalyticsResponse>("/admin");
};

// Appointment Services

export const getAllAppointments = async () => {
  return await axios.get('/admin/appointments');
};

export const approveAppointment = async (id: string) => {
  return await axios.put(`/admin/appointments/${id}/approve`);
};

export const rejectAppointment = async (id: string) => {
  return await axios.put(`/admin/appointments/${id}/reject`);
};


// Category Services
// Get single category by ID
export const getSingleCategory = async (id: string) => {
  return await axios.get(`/admin/categories/${id}`);
};

export const createCategory = async (data: FormData) => {
  return axios.post("/admin/categories", data);
};

export const updateCategory = async (id: string, data: FormData) => {
  return axios.put(`/admin/categories/${id}`, data);
};


// Delete category
export const deleteCategory = async (id: string) => {
  return await axios.delete(`/admin/categories/${id}`);
};

