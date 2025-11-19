import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getProfile,
  updateProfile,
  getWallet,
  topupWallet,
  addCryptoWallet,
  getNotifications,
  markNotificationRead,
  getSavedPlaces,
  updateFCMToken,
  getReferralInfo,
} from '../controllers/user.controller';

const router = express.Router();
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Wallet routes
router.get('/wallet', getWallet);
router.post('/wallet/topup', topupWallet);
router.post('/wallet/crypto', addCryptoWallet);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId/read', markNotificationRead);

// Saved places
router.get('/saved-places', getSavedPlaces);

// FCM Token (for push notifications)
router.post('/fcm-token', updateFCMToken);

// Referrals
router.get('/referrals', getReferralInfo);

export default router;
