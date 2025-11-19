import express from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
router.use(authenticate);

// Placeholder routes - implement controllers as needed
router.get('/profile', (req, res) => res.json({ message: 'Get user profile' }));
router.put('/profile', (req, res) => res.json({ message: 'Update user profile' }));
router.get('/wallet', (req, res) => res.json({ message: 'Get wallet balance' }));
router.post('/wallet/topup', (req, res) => res.json({ message: 'Top up wallet' }));

export default router;
