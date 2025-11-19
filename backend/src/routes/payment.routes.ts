import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createPaymentIntent, handleWebhook, processWalletTopup } from '../controllers/payment.controller';

const router = express.Router();

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/wallet/topup', authenticate, processWalletTopup);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
