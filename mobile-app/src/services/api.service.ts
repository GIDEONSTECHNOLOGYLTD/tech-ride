import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api'; // Change for production

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyOTP: (data: any) => api.post('/auth/verify-otp', data),
};

export const rideAPI = {
  requestRide: (data: any) => api.post('/rides/request', data),
  acceptRide: (rideId: string) => api.post(`/rides/${rideId}/accept`),
  cancelRide: (rideId: string, reason: string) => api.post(`/rides/${rideId}/cancel`, { reason }),
  getRideDetails: (rideId: string) => api.get(`/rides/${rideId}`),
  getRideHistory: (page = 1) => api.get(`/rides/history/all?page=${page}`),
  calculateFare: (data: any) => api.post('/rides/calculate-fare', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getWallet: () => api.get('/users/wallet'),
  topupWallet: (amount: number) => api.post('/users/wallet/topup', { amount }),
};

export default api;
