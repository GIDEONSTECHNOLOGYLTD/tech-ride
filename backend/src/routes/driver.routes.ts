import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('DRIVER'));

// Placeholder routes - implement controllers as needed
router.post('/register', (req, res) => res.json({ message: 'Register as driver' }));
router.get('/earnings', (req, res) => res.json({ message: 'Get driver earnings' }));
router.get('/stats', (req, res) => res.json({ message: 'Get driver stats' }));

export default router;
