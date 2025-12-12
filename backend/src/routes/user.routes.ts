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

export default router;
