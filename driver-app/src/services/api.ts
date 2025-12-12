import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://tech-ride.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (__DEV__) {
      console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
      console.log('🌐 Full URL:', (config.baseURL || '') + (config.url || ''));
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network error
    if (!error.response) {
      error.isNetworkError = true;
      error.message = 'Network error. Please check your internet connection.';
      return Promise.reject(error);
    }

    // Token expired or invalid
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      // Emit event for navigation (AuthContext will handle)
      if ((global as any).authExpired) {
        (global as any).authExpired = true;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (phoneNumber: string, password: string) =>
    api.post('/auth/login', { phoneNumber, password }),
  register: (data: any) => api.post('/auth/register', data),
  verifyOTP: (phoneNumber: string, otp: string) =>
    api.post('/auth/verify-otp', { phoneNumber, otp }),
  resendOTP: (phoneNumber: string) => api.post('/auth/resend-otp', { phoneNumber }),
};

// Driver API
export const driverAPI = {
  registerDriver: (data: any) => api.post('/drivers/register', data),
  getProfile: () => api.get('/drivers/profile'),
  updateProfile: (data: any) => api.put('/drivers/profile', data),
  updateStatus: (isOnline: boolean) => api.put('/drivers/status', { isOnline }),
  updateLocation: (latitude: number, longitude: number, heading?: number) =>
    api.put('/drivers/location', { latitude, longitude, heading }),
  getEarnings: (period: string = 'today') => api.get(`/drivers/earnings?period=${period}`),
  getStats: () => api.get('/drivers/stats'),
  updateBankDetails: (data: any) => api.put('/drivers/bank-details', data),
  requestPayout: (amount: number) => api.post('/drivers/payout', { amount }),
  getRideHistory: (page: number = 1) => api.get(`/drivers/rides?page=${page}`),
  updateDocuments: (formData: any) => {
    return api.put('/drivers/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Ride API
export const rideAPI = {
  acceptRide: (rideId: string) => api.post(`/rides/${rideId}/accept`),
  startRide: (rideId: string) => api.post(`/rides/${rideId}/start`),
  completeRide: (rideId: string, data?: any) => api.post(`/rides/${rideId}/complete`, data),
  cancelRide: (rideId: string, reason: string) =>
    api.post(`/rides/${rideId}/cancel`, { reason }),
  getRideDetails: (rideId: string) => api.get(`/rides/${rideId}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  updateFCMToken: (fcmToken: string) => api.post('/users/fcm-token', { fcmToken }),
};
