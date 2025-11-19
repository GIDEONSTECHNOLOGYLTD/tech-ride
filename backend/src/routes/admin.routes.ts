import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('ADMIN'));

// Placeholder routes - implement controllers as needed
router.get('/dashboard', (req, res) => res.json({ message: 'Admin dashboard data' }));
router.get('/users', (req, res) => res.json({ message: 'Get all users' }));
router.get('/drivers/pending', (req, res) => res.json({ message: 'Get pending driver approvals' }));
router.post('/drivers/:id/approve', (req, res) => res.json({ message: 'Approve driver' }));

export default router;
