// services/appointmentService.ts
import axios from '../lib/axios'; // your configured axios instance

interface AppointmentData {
  providerId?: string;
  start?: string;
  end?: string;
  user?: string; // optional, for admin creating bookings
}

export const getUserAppointments = async () => {
  // Logged-in user: get their appointments
  return await axios.get('/appointment');
};

export const createAppointment = async (data: AppointmentData) => {
  return await axios.post('/appointment', data);
};

export const cancelAppointment = async (id: string) => {
  return await axios.put(`/appointment/${id}/cancel`);
};

export const rescheduleAppointment = async (id: string, data: { start: string; end: string }) => {
  return await axios.put(`/appointment/${id}/reschedule`, data);
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
