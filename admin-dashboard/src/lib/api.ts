import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: (phoneNumber: string, password: string) =>
    api.post('/auth/login', { phoneNumber, password }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/admin/stats'),
  getRevenue: (period: string = 'month') => api.get(`/admin/revenue?period=${period}`),
};

// Users API
export const usersAPI = {
  getAll: (page = 1, limit = 20) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/admin/users/${id}`),
  block: (id: string) => api.put(`/admin/users/${id}/block`),
  unblock: (id: string) => api.put(`/admin/users/${id}/unblock`),
};

// Drivers API
export const driversAPI = {
  getAll: (page = 1, limit = 20, status?: string) =>
    api.get(`/admin/drivers?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
  getById: (id: string) => api.get(`/admin/drivers/${id}`),
  approve: (id: string) => api.put(`/admin/drivers/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.put(`/admin/drivers/${id}/reject`, { reason }),
  block: (id: string) => api.put(`/admin/drivers/${id}/block`),
  unblock: (id: string) => api.put(`/admin/drivers/${id}/unblock`),
};

// Rides API
export const ridesAPI = {
  getAll: (page = 1, limit = 20, status?: string) =>
    api.get(`/admin/rides?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
  getById: (id: string) => api.get(`/admin/rides/${id}`),
  cancel: (id: string, reason: string) =>
    api.post(`/admin/rides/${id}/cancel`, { reason }),
};

// Promo Codes API
export const promoAPI = {
  getAll: (page = 1) => api.get(`/admin/promo?page=${page}`),
  create: (data: any) => api.post('/admin/promo', data),
  update: (id: string, data: any) => api.put(`/admin/promo/${id}`, data),
  delete: (id: string) => api.delete(`/admin/promo/${id}`),
};

// Payments API
export const paymentsAPI = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/payments/history?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/payments/${id}`),
};

export default api;
