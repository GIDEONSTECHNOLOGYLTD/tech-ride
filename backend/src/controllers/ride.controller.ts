import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Ride from '../models/Ride';
import User from '../models/User';
import Driver from '../models/Driver';
import Payment from '../models/Payment';
import PromoCode from '../models/PromoCode';
import Notification from '../models/Notification';
import pricingService from '../services/pricing.service';
import firebaseService from '../services/firebase.service';
import paystackService from '../services/paystack.service';
import { io } from '../server';
import logger from '../utils/logger.util';
import { isWithinGeofence, calculateDistance as geoCalculateDistance, isValidCoordinates, isWithinNigeria } from '../utils/geofence.util';

// Calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const requestRide = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pickupAddress, pickupLatitude, pickupLongitude,
      dropoffAddress, dropoffLatitude, dropoffLongitude,
      vehicleType, paymentMethod, scheduledFor, promoCode,
    } = req.body;

    const userId = (req as any).user.userId;

    // CRITICAL: Validate coordinates
    const pickup = { latitude: pickupLatitude, longitude: pickupLongitude };
    const dropoff = { latitude: dropoffLatitude, longitude: dropoffLongitude };

    if (!isValidCoordinates(pickup) || !isValidCoordinates(dropoff)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Validate service area (Nigeria only)
    if (!isWithinNigeria(pickup) || !isWithinNigeria(dropoff)) {
      return res.status(400).json({
        error: 'Service not available in this location',
        message: 'TechRide currently operates only within Nigeria',
      });
    }

    // Calculate distance and duration
    const distance = calculateDistance(pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude);
    const estimatedDuration = Math.ceil((distance / 40) * 60); // Assume 40 km/h average

    // Calculate fare using AI pricing
    const pricingResult = await pricingService.calculateDynamicFare({
      distance,
      duration: estimatedDuration,
      vehicleType,
      time: new Date(),
      pickupLocation: [pickupLongitude, pickupLatitude],
    });

    let discount = 0;
    let promoCodeDoc = null;

    // Apply promo code if provided
    if (promoCode) {
      promoCodeDoc = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (promoCodeDoc && promoCodeDoc.currentUsage < promoCodeDoc.maxUsageTotal) {
        if (promoCodeDoc.discountType === 'PERCENTAGE') {
          discount = (pricingResult.estimatedFare * promoCodeDoc.discountValue) / 100;
          if (promoCodeDoc.maxDiscount) {
            discount = Math.min(discount, promoCodeDoc.maxDiscount);
          }
        } else {
          discount = promoCodeDoc.discountValue;
        }

        // Update promo code usage
        promoCodeDoc.currentUsage += 1;
        await promoCodeDoc.save();
      }
    }

    const finalFare = Math.max(pricingResult.estimatedFare - discount, 0);

    // Create ride
    const ride = new Ride({
      riderId: userId,
      pickupLocation: {
        type: 'Point',
        coordinates: [pickupLongitude, pickupLatitude],
        address: pickupAddress,
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [dropoffLongitude, dropoffLatitude],
        address: dropoffAddress,
      },
      vehicleType,
      status: 'PENDING',
      estimatedFare: finalFare,
      distance,
      duration: estimatedDuration,
      baseFare: pricingResult.baseFare,
      perKmRate: pricingResult.distanceCharge / distance,
      perMinuteRate: pricingResult.timeCharge / estimatedDuration,
      surgeMultiplier: pricingResult.surgeMultiplier,
      discount,
      promoCode: promoCode || undefined,
      paymentMethod,
      currency: 'NGN',
      platformCommission: 0.15,
      isScheduled: !!scheduledFor,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      aiPricingFactors: {
        demandScore: pricingResult.aiFactors.demandScore,
        supplyScore: pricingResult.aiFactors.supplyScore,
        weatherFactor: pricingResult.aiFactors.weatherMultiplier,
        timeFactor: pricingResult.aiFactors.timeMultiplier,
        eventFactor: pricingResult.aiFactors.eventMultiplier,
      },
    });

    await ride.save();

    // Find nearby drivers (within 5km)
    const nearbyDrivers = await Driver.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [pickupLongitude, pickupLatitude],
          },
          $maxDistance: 5000, // 5km in meters
        },
      },
      vehicleType,
      isOnline: true,
      isAvailable: true,
      isApproved: true,
    }).limit(10);

    // Notify nearby drivers via Socket.IO
    nearbyDrivers.forEach((driver) => {
      io.to(`driver_${driver.userId}`).emit('new-ride-request', {
        rideId: ride._id,
        pickup: pickupAddress,
        dropoff: dropoffAddress,
        fare: finalFare,
        distance,
        vehicleType,
      });

      // Send push notification
      User.findById(driver.userId).then((driverUser) => {
        if (driverUser?.fcmToken) {
          firebaseService.sendToDevice(
            driverUser.fcmToken,
            'New Ride Request',
            `${distance.toFixed(1)}km ride to ${dropoffAddress}`,
            { rideId: ride._id.toString(), type: 'new_ride' }
          );
        }
      });
    });

    res.status(201).json({
      success: true,
      message: 'Ride requested successfully',
      ride: {
        id: ride._id,
        status: ride.status,
        estimatedFare: finalFare,
        distance,
        duration: estimatedDuration,
        vehicleType,
        nearbyDriversCount: nearbyDrivers.length,
      },
    });
  } catch (error: any) {
    console.error('Request ride error:', error);
    res.status(500).json({ error: 'Failed to request ride', details: error.message });
  }
};

export const acceptRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const driverId = (req as any).user.userId;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'PENDING') {
      return res.status(400).json({ error: 'Ride is no longer available' });
    }

    const driver = await Driver.findOne({ userId: driverId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Update ride
    ride.driverId = driver._id;
    ride.status = 'ACCEPTED';
    ride.acceptedAt = new Date();
    await ride.save();

    // Update driver
    driver.isAvailable = false;
    driver.currentRideId = ride._id;
    await driver.save();

    // Calculate driver earnings
    const driverEarnings = ride.estimatedFare * (1 - ride.platformCommission);
    ride.driverEarnings = driverEarnings;
    await ride.save();

    // Notify rider
    io.to(`user_${ride.riderId}`).emit('ride-accepted', {
      rideId: ride._id,
      driver: {
        name: (await User.findById(driver.userId))?.firstName,
        rating: driver.rating,
        vehicleModel: driver.vehicleModel,
        licensePlate: driver.licensePlate,
      },
    });

    // Send push notification to rider
    const rider = await User.findById(ride.riderId);
    if (rider?.fcmToken) {
      firebaseService.sendToDevice(
        rider.fcmToken,
        'Driver Found!',
        `Your driver is on the way`,
        { rideId: ride._id.toString(), type: 'ride_accepted' }
      );
    }

    res.json({
      success: true,
      message: 'Ride accepted successfully',
      ride: {
        id: ride._id,
        status: ride.status,
        estimatedEarnings: driverEarnings,
      },
    });
  } catch (error: any) {
    console.error('Accept ride error:', error);
    res.status(500).json({ error: 'Failed to accept ride', details: error.message });
  }
};

export const startRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { driverLatitude, driverLongitude } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'ARRIVED') {
      return res.status(400).json({ error: 'Driver must arrive at pickup first' });
    }

    // CRITICAL: Validate driver is at pickup location
    if (driverLatitude && driverLongitude) {
      const driverLocation = { latitude: driverLatitude, longitude: driverLongitude };
      const pickupLocation = {
        latitude: ride.pickup.coordinates[1],
        longitude: ride.pickup.coordinates[0],
      };

      const dist = geoCalculateDistance(driverLocation, pickupLocation);
      
      // Allow starting within 150m of pickup (account for GPS accuracy)
      if (!isWithinGeofence(driverLocation, pickupLocation, 150)) {
        return res.status(400).json({
          error: 'Cannot start ride - not at pickup location',
          distance: Math.round(dist),
          required: 'Must be within 150m of pickup',
        });
      }
    }

    ride.status = 'IN_PROGRESS';
    ride.startedAt = new Date();
    await ride.save();

    // Notify rider
    io.to(`user_${ride.riderId}`).emit('ride-started', {
      rideId: ride._id,
      startedAt: ride.startedAt,
    });

    res.json({
      success: true,
      message: 'Ride started successfully',
      ride: {
        id: ride._id,
        status: ride.status,
        startedAt: ride.startedAt,
      },
    });
  } catch (error: any) {
    console.error('Start ride error:', error);
    res.status(500).json({ error: 'Failed to start ride', details: error.message });
  }
};

export const completeRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { actualDistance, actualDuration, driverLatitude, driverLongitude } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Ride is not in progress' });
    }

    // CRITICAL: Validate driver is at dropoff location
    if (driverLatitude && driverLongitude) {
      const driverLocation = { latitude: driverLatitude, longitude: driverLongitude };
      const dropoffLocation = {
        latitude: ride.dropoff.coordinates[1],
        longitude: ride.dropoff.coordinates[0],
      };

      const dist = geoCalculateDistance(driverLocation, dropoffLocation);
      
      // Allow completing within 150m of dropoff
      if (!isWithinGeofence(driverLocation, dropoffLocation, 150)) {
        return res.status(400).json({
          error: 'Cannot complete ride - not at dropoff location',
          distance: Math.round(dist),
          required: 'Must be within 150m of dropoff',
        });
      }
    }

    // Recalculate fare based on actual distance/duration
    if (actualDistance && actualDuration) {
      const actualFare = ride.baseFare + 
        (actualDistance * ride.perKmRate) + 
        (actualDuration * ride.perMinuteRate);
      ride.finalFare = Math.round(actualFare * ride.surgeMultiplier - ride.discount);
      ride.distance = actualDistance;
      ride.duration = actualDuration;
    } else {
      ride.finalFare = ride.estimatedFare;
    }

    ride.status = 'COMPLETED';
    ride.completedAt = new Date();
    ride.driverEarnings = ride.finalFare * (1 - ride.platformCommission);
    await ride.save();

    // Process payment
    const payment = new Payment({
      rideId: ride._id,
      userId: ride.riderId,
      driverId: ride.driverId,
      amount: ride.finalFare,
      currency: ride.currency,
      method: ride.paymentMethod,
      status: ride.paymentMethod === 'CASH' ? 'COMPLETED' : 'PENDING',
      baseFare: ride.baseFare,
      surgeCharge: (ride.finalFare - ride.baseFare - (ride.distance * ride.perKmRate)),
      discount: ride.discount,
      platformCommission: ride.finalFare * ride.platformCommission,
      driverEarnings: ride.driverEarnings,
    });

    await payment.save();

    // Update payment status in ride (cast to avoid type error)
    ride.paymentStatus = payment.status as any;
    await ride.save();

    // Update driver
    const driver = await Driver.findById(ride.driverId);
    if (driver) {
      driver.isAvailable = true;
      driver.currentRideId = undefined;
      driver.totalRides += 1;
      driver.completedRides += 1;
      driver.totalEarnings += ride.driverEarnings;
      
      // FIXED: Add earnings directly to availableBalance for instant withdrawal
      // For production, you can add a settlement delay if needed
      driver.availableBalance += ride.driverEarnings;
      
      // Keep track in pendingEarnings for accounting (will be cleared on withdrawal)
      driver.pendingEarnings += ride.driverEarnings;
      
      await driver.save();
    }

    // Update rider stats
    const rider = await User.findById(ride.riderId);
    if (rider) {
      rider.totalRides += 1;
      
      // Wallet already charged at payment initialization - no need to charge again
      // Only handle fare adjustments if actual fare differs from estimated
      if (ride.paymentMethod === 'WALLET' && ride.finalFare !== ride.estimatedFare) {
        const fareAdjustment = ride.finalFare - ride.estimatedFare;
        
        if (fareAdjustment > 0) {
          // Fare increased - charge difference
          if (rider.walletBalance >= fareAdjustment) {
            rider.walletBalance -= fareAdjustment;
            payment.amount = ride.finalFare;
          } else {
            // Cannot charge difference - mark as partial payment
            payment.status = 'COMPLETED';  // Original charge still valid
            payment.failureReason = `Fare adjustment of ₦${fareAdjustment} could not be charged`;
          }
        } else if (fareAdjustment < 0) {
          // Fare decreased - refund difference
          rider.walletBalance += Math.abs(fareAdjustment);
          payment.amount = ride.finalFare;
        }
        await payment.save();
      }
      
      await rider.save();
    }

    // Notify both parties
    io.to(`user_${ride.riderId}`).emit('ride-completed', {
      rideId: ride._id,
      finalFare: ride.finalFare,
      distance: ride.distance,
    });

    io.to(`driver_${driver?.userId}`).emit('ride-completed', {
      rideId: ride._id,
      earnings: ride.driverEarnings,
    });

    res.json({
      success: true,
      message: 'Ride completed successfully',
      ride: {
        id: ride._id,
        status: ride.status,
        finalFare: ride.finalFare,
        distance: ride.distance,
        duration: ride.duration,
        driverEarnings: ride.driverEarnings,
        paymentStatus: payment.status,
      },
    });
  } catch (error: any) {
    console.error('Complete ride error:', error);
    res.status(500).json({ error: 'Failed to complete ride', details: error.message });
  }
};

export const cancelRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot cancel this ride' });
    }

    // Cancellation fee logic (charge if driver already arrived)
    const previousStatus = ride.status;
    if (previousStatus === 'ARRIVED' || previousStatus === 'IN_PROGRESS') {
      ride.cancellationFee = 500; // ₦500 cancellation fee
    }

    ride.status = 'CANCELLED';
    ride.cancelledAt = new Date();
    ride.cancelledBy = userRole === 'DRIVER' ? 'DRIVER' : 'RIDER';
    ride.cancellationReason = reason;

    await ride.save();

    // Update driver availability if driver was assigned
    if (ride.driverId) {
      const driver = await Driver.findById(ride.driverId);
      if (driver) {
        driver.isAvailable = true;
        driver.currentRideId = undefined;
        driver.cancelledRides += 1;
        await driver.save();
      }
    }

    // Notify other party
    const otherPartyId = userRole === 'DRIVER' ? ride.riderId : ride.driverId;
    if (otherPartyId) {
      io.to(`user_${otherPartyId}`).emit('ride-cancelled', {
        rideId: ride._id,
        reason,
        cancelledBy: ride.cancelledBy,
      });
    }

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      ride: {
        id: ride._id,
        status: ride.status,
        cancellationFee: ride.cancellationFee,
      },
    });
  } catch (error: any) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ error: 'Failed to cancel ride', details: error.message });
  }
};

export const getRideDetails = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId)
      .populate('riderId', 'firstName lastName phoneNumber profilePhoto rating')
      .populate({
        path: 'driverId',
        populate: {
          path: 'userId',
          select: 'firstName lastName phoneNumber profilePhoto rating',
        },
      });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json({
      success: true,
      ride,
    });
  } catch (error: any) {
    console.error('Get ride details error:', error);
    res.status(500).json({ error: 'Failed to get ride details', details: error.message });
  }
};

export const getRideHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 20, status } = req.query;

    const query: any = { riderId: userId };
    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('driverId', 'vehicleModel licensePlate rating');

    const total = await Ride.countDocuments(query);

    res.json({
      success: true,
      rides,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get ride history error:', error);
    res.status(500).json({ error: 'Failed to get ride history', details: error.message });
  }
};

export const calculateFare = async (req: Request, res: Response) => {
  try {
    const { pickupLat, pickupLon, dropoffLat, dropoffLon, vehicleType } = req.body;

    const distance = calculateDistance(pickupLat, pickupLon, dropoffLat, dropoffLon);
    const duration = Math.ceil((distance / 40) * 60);

    const pricing = await pricingService.calculateDynamicFare({
      distance,
      duration,
      vehicleType,
      time: new Date(),
      pickupLocation: [pickupLon, pickupLat],
    });

    res.json({
      success: true,
      fare: pricing,
    });
  } catch (error: any) {
    console.error('Calculate fare error:', error);
    res.status(500).json({ error: 'Failed to calculate fare', details: error.message });
  }
};
