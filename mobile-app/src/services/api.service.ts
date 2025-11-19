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
  startRide: (rideId: string) => api.post(`/rides/${rideId}/start`),
  completeRide: (rideId: string) => api.post(`/rides/${rideId}/complete`),
  cancelRide: (rideId: string, reason: string) => api.post(`/rides/${rideId}/cancel`, { reason }),
  getRideDetails: (rideId: string) => api.get(`/rides/${rideId}`),
  getRideHistory: (page = 1) => api.get(`/rides/history?page=${page}`),
  calculateFare: (data: any) => api.post('/rides/calculate-fare', data),
  rateRide: (rideId: string, rating: number, comment?: string) => 
    api.post(`/rides/${rideId}/rate`, { rating, comment }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getWallet: () => api.get('/users/wallet'),
  topupWallet: (amount: number, method: string) => 
    api.post('/users/wallet/topup', { amount, method }),
  addCryptoWallet: (currency: string, address: string) => 
    api.post('/users/wallet/crypto', { currency, address }),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (notificationId: string) => 
    api.put(`/users/notifications/${notificationId}/read`),
  updateFCMToken: (fcmToken: string) => 
    api.post('/users/fcm-token', { fcmToken }),
  getReferralInfo: () => api.get('/users/referral'),
};

export const paymentAPI = {
  // Paystack
  initializePaystackPayment: (rideId: string, amount: number) => 
    api.post('/payments/initialize', { rideId, amount, method: 'PAYSTACK' }),
  verifyPaystackPayment: (reference: string) => 
    api.post('/payments/verify', { reference }),
  
  // Crypto
  initializeCryptoPayment: (rideId: string, amount: number, currency: string) => 
    api.post('/payments/initialize', { rideId, amount, method: 'CRYPTO', currency }),
  verifyCryptoPayment: (txHash: string, currency: string) => 
    api.post('/payments/crypto/verify', { txHash, currency }),
  getCryptoPrices: () => api.get('/payments/crypto/prices'),
  
  // Wallet
  payWithWallet: (rideId: string, amount: number) => 
    api.post('/payments/initialize', { rideId, amount, method: 'WALLET' }),
  
  // Cash
  payWithCash: (rideId: string) => 
    api.post('/payments/initialize', { rideId, method: 'CASH' }),
  
  // History
  getPaymentHistory: (page = 1) => api.get(`/payments/history?page=${page}`),
};

export const promoAPI = {
  validatePromoCode: (code: string) => api.post('/promo/validate', { code }),
  applyPromoCode: (code: string, rideId: string) => 
    api.post('/promo/apply', { code, rideId }),
};

export default api;
