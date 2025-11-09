import axios from 'axios';

// In production, use relative URL (same domain). In development, use explicit localhost URL
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const appointmentsAPI = {
  // Get all appointments (with pagination)
  getAllAppointments: async (page = 1, perPage = 5) => {
    const response = await api.get('/appointments', {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  // Get available time slots
  getAvailableSlots: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get('/appointments/available', { params });
    return response.data;
  },

  // Create a new appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', {
      appointment: appointmentData,
    });
    return response.data;
  },

  // Cancel an appointment
  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

export default api;
