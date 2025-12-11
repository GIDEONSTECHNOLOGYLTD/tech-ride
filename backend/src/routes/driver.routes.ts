import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';
import { uploadFields } from '../middleware/upload.middleware';
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

// Registration (before becoming driver) - with file uploads
router.post('/register', uploadFields([
  { name: 'licensePhoto', maxCount: 1 },
  { name: 'vehicleRegistration', maxCount: 1 },
  { name: 'insurance', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 },
]), registerDriver);

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
