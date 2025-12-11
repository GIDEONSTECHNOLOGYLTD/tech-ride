import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';
import {
  registerDriver,
  getDriverProfile,
  updateDriverStatus,
  updateLocation,
  getEarnings,
  getDriverStats,
  updateBankDetails,
  requestPayout,
  getRideHistory,
} from '../controllers/driver.controller';

const router = express.Router();
router.use(authenticate);

// Registration (before becoming driver)
router.post('/register', registerDriver);

// Driver-only routes
router.use(authorizeRole('DRIVER'));

router.get('/profile', getDriverProfile);
router.put('/status', updateDriverStatus);
router.put('/location', updateLocation);
router.get('/earnings', getEarnings);
router.get('/stats', getDriverStats);
router.put('/bank-details', updateBankDetails);
router.post('/payout', requestPayout);
router.get('/rides', getRideHistory);

export default router;
