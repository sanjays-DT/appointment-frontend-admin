// services/appointmentService.ts
import axios from '../lib/axios'; // your configured axios instance

interface AppointmentData {
  providerId?: string;
  start?: string;
  end?: string;
  user?: string; // optional, for admin creating bookings
}

export const getAllAppointments = async () => {
  // Admin: get all appointments
  return await axios.get('/appointment');
};

export const getUserAppointments = async () => {
  // Logged-in user: get their appointments
  return await axios.get('/appointment');
};

export const createAppointment = async (data: AppointmentData) => {
  return await axios.post('/appointment', data);
};

export const approveAppointment = async (id: string) => {
  return await axios.put(`/appointment/${id}/approve`);
};

export const rejectAppointment = async (id: string) => {
  return await axios.put(`/appointment/${id}/reject`);
};

export const cancelAppointment = async (id: string) => {
  return await axios.put(`/appointment/${id}/cancel`);
};

export const rescheduleAppointment = async (id: string, data: { start: string; end: string }) => {
  return await axios.put(`/appointment/${id}/reschedule`, data);
};
