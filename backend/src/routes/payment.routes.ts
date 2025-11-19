import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  initializePayment,
  verifyPayment,
  verifyCryptoPayment,
  handleWebhook,
  getPaymentHistory,
} from '../controllers/payment.controller';

const router = express.Router();

// Payment routes
router.post('/initialize', authenticate, initializePayment);
router.get('/verify/:reference', authenticate, verifyPayment);
router.post('/verify-crypto', authenticate, verifyCryptoPayment);
router.get('/history', authenticate, getPaymentHistory);

// Webhook (no auth - verified via signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
