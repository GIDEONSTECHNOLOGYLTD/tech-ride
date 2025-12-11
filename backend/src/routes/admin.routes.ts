import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getUsers,
  getPendingDrivers,
  approveDriver,
  rejectDriver,
  getAllRides,
  blockUser,
  unblockUser,
  createPromoCode,
  getPromoCodes,
  getRevenue,
} from '../controllers/admin.controller';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenue);

// User management
router.get('/users', getUsers);
router.post('/users/:userId/block', blockUser);
router.post('/users/:userId/unblock', unblockUser);

// Driver management
router.get('/drivers/pending', getPendingDrivers);
router.post('/drivers/:driverId/approve', approveDriver);
router.post('/drivers/:driverId/reject', rejectDriver);

// Ride management
router.get('/rides', getAllRides);

// Promo codes
router.get('/promo-codes', getPromoCodes);
router.post('/promo-codes', createPromoCode);

export default router;
