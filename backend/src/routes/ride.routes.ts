import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { normalUserRateLimit, strictUserRateLimit } from '../middleware/user-rate-limit.middleware';
import {
  requestRide,
  acceptRide,
  cancelRide,
  startRide,
  completeRide,
  getRideDetails,
  getRideHistory,
  calculateFare,
} from '../controllers/ride.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(normalUserRateLimit); // Apply per-user rate limiting

// Request a ride (stricter rate limit - expensive operation)
router.post(
  '/request',
  strictUserRateLimit,
  [
    body('pickupAddress').notEmpty(),
    body('pickupLatitude').isFloat(),
    body('pickupLongitude').isFloat(),
    body('dropoffAddress').notEmpty(),
    body('dropoffLatitude').isFloat(),
    body('dropoffLongitude').isFloat(),
    body('vehicleType').isIn(['ECONOMY', 'COMFORT', 'XL', 'BIKE']),
    body('paymentMethod').isIn(['WALLET', 'CASH', 'PAYSTACK', 'CRYPTO']),
  ],
  requestRide
);

// Accept ride (driver)
router.post('/:rideId/accept', acceptRide);

// Cancel ride
router.post('/:rideId/cancel', cancelRide);

// Start ride (driver)
router.post('/:rideId/start', startRide);

// Complete ride (driver)
router.post('/:rideId/complete', completeRide);

// Get ride details
router.get('/:rideId', getRideDetails);

// Get ride history
router.get('/history/all', getRideHistory);

// Calculate fare
router.post('/calculate-fare', calculateFare);

export default router;
