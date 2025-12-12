import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getBanks, verifyAccountNumber } from '../controllers/bank.controller';

const router = express.Router();
router.use(authenticate);

// Get list of Nigerian banks
router.get('/', getBanks);

// Verify bank account number
router.post('/verify', verifyAccountNumber);

export default router;
