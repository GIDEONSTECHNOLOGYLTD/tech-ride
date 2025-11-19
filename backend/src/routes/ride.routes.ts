import express from 'express';
import { body } from 'express-validator';
import {
  requestRide,
  acceptRide,
  cancelRide,
  startRide,
  completeRide,
  getRideDetails,
  getRideHistory,
  getNearbyDrivers,
  calculateFare,
  trackRide,
} from '../controllers/ride.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Request a ride
router.post(
  '/request',
  [
    body('pickupAddress').notEmpty(),
    body('pickupLatitude').isFloat(),
    body('pickupLongitude').isFloat(),
    body('dropoffAddress').notEmpty(),
    body('dropoffLatitude').isFloat(),
    body('dropoffLongitude').isFloat(),
    body('vehicleType').isIn(['ECONOMY', 'COMFORT', 'XL', 'BIKE']),
    body('paymentMethod').isIn(['CASH', 'CARD', 'WALLET']),
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

// Get nearby drivers
router.post('/nearby-drivers', getNearbyDrivers);

// Calculate fare
router.post('/calculate-fare', calculateFare);

// Track ride (real-time updates)
router.get('/:rideId/track', trackRide);

export default router;
