import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getProfile,
  updateProfile,
  addCryptoWallet,
  getNotifications,
  markNotificationRead,
  updateFCMToken,
  topUpWallet,
  verifyWalletTopUp,
  getNearbyDrivers,
} from '../controllers/user.controller';

const router = express.Router();
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Wallet routes
router.post('/crypto-wallet', addCryptoWallet);
router.post('/wallet/topup', topUpWallet);
router.get('/wallet/topup/verify/:reference', verifyWalletTopUp);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);

// FCM Token (for push notifications)
router.post('/fcm-token', updateFCMToken);

// Nearby drivers (for riders)
router.get('/nearby-drivers', getNearbyDrivers);

export default router;
