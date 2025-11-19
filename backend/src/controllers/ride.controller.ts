import { Request, Response } from 'express';
import { PrismaClient, RideStatus, PaymentStatus } from '@prisma/client';
import { validationResult } from 'express-validator';
import { calculateDistance, calculateFareAmount } from '../utils/distance.util';
import { findNearbyDrivers } from '../utils/driver.util';
import { io } from '../server';

const prisma = new PrismaClient();

export const requestRide = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pickupAddress, pickupLatitude, pickupLongitude,
      dropoffAddress, dropoffLatitude, dropoffLongitude,
      vehicleType, paymentMethod, scheduledTime, specialRequests, promoCode,
    } = req.body;

    const userId = (req as any).user.userId;
    const distance = calculateDistance(pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude);
    const estimatedDuration = Math.ceil((distance / 40) * 60);
    const fareDetails = await calculateFareAmount(distance, estimatedDuration, vehicleType);

    let discount = 0;
    if (promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: { code: promoCode, isActive: true, validFrom: { lte: new Date() }, validUntil: { gte: new Date() } },
      });
      if (promo && (!promo.maxUses || promo.usedCount < promo.maxUses)) {
        discount = promo.discountType === 'PERCENTAGE'
          ? Math.min((fareDetails.totalFare * promo.discountValue) / 100, promo.maxDiscount || Infinity)
          : promo.discountValue;
      }
    }

    const finalFare = Math.max(fareDetails.totalFare - discount, 0);

    const ride = await prisma.ride.create({
      data: {
        riderId: userId, pickupAddress, pickupLatitude, pickupLongitude,
        dropoffAddress, dropoffLatitude, dropoffLongitude, vehicleType, paymentMethod,
        estimatedDistance: distance, estimatedDuration, estimatedFare: finalFare,
        surgeMultiplier: fareDetails.surgeMultiplier, promoCode, discount,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null, specialRequests,
      },
      include: { rider: { select: { id: true, firstName: true, lastName: true, phoneNumber: true, profileImage: true, rating: true } } },
    });

    const nearbyDrivers = await findNearbyDrivers(pickupLatitude, pickupLongitude, vehicleType, 5);
    nearbyDrivers.forEach((driver) => {
      io.to(`driver-${driver.userId}`).emit('ride-request', { rideId: ride.id, pickup: { address: pickupAddress, latitude: pickupLatitude, longitude: pickupLongitude }, dropoff: { address: dropoffAddress, latitude: dropoffLatitude, longitude: dropoffLongitude }, estimatedFare: finalFare, distance, rider: ride.rider });
    });

    res.status(201).json({ ride: { id: ride.id, status: ride.status, pickup: { address: pickupAddress, latitude: pickupLatitude, longitude: pickupLongitude }, dropoff: { address: dropoffAddress, latitude: dropoffLatitude, longitude: dropoffLongitude }, estimatedFare: finalFare, estimatedDistance: distance, estimatedDuration, vehicleType }, message: 'Ride requested successfully. Finding drivers...' });
  } catch (error) {
    console.error('Request ride error:', error);
    res.status(500).json({ error: 'Failed to request ride' });
  }
};

export const acceptRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const driverId = (req as any).user.userId;
    const driver = await prisma.driver.findUnique({ where: { userId: driverId } });
    if (!driver || !driver.isApproved) return res.status(403).json({ error: 'Driver not approved' });

    const ride = await prisma.ride.findUnique({ where: { id: rideId }, include: { rider: true } });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.status !== RideStatus.REQUESTED) return res.status(400).json({ error: 'Ride not available' });

    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: { driverId, status: RideStatus.ACCEPTED, acceptedAt: new Date() },
    });

    await prisma.driver.update({ where: { userId: driverId }, data: { isAvailable: false } });
    io.to(`user-${ride.riderId}`).emit('ride-accepted', { rideId: ride.id });
    res.json({ message: 'Ride accepted successfully', ride: updatedRide });
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({ error: 'Failed to accept ride' });
  }
};

export const cancelRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user.userId;
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.riderId !== userId && ride.driverId !== userId) return res.status(403).json({ error: 'Not authorized' });
    if (ride.status === RideStatus.COMPLETED || ride.status === RideStatus.CANCELLED) return res.status(400).json({ error: 'Cannot cancel this ride' });

    const updatedRide = await prisma.ride.update({ where: { id: rideId }, data: { status: RideStatus.CANCELLED, cancelledAt: new Date(), cancellationReason: reason } });
    if (ride.driverId && ride.driverId === userId) {
      await prisma.driver.update({ where: { userId: ride.driverId }, data: { isAvailable: true } });
    }

    const otherUserId = userId === ride.riderId ? ride.driverId : ride.riderId;
    if (otherUserId) io.to(`user-${otherUserId}`).emit('ride-cancelled', { rideId: ride.id, reason });
    res.json({ message: 'Ride cancelled successfully', ride: updatedRide });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel ride' });
  }
};

export const startRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const driverId = (req as any).user.userId;
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride || ride.driverId !== driverId) return res.status(403).json({ error: 'Not authorized' });
    if (ride.status !== RideStatus.ARRIVED) return res.status(400).json({ error: 'Cannot start ride at this stage' });

    const updatedRide = await prisma.ride.update({ where: { id: rideId }, data: { status: RideStatus.IN_PROGRESS, startedAt: new Date() } });
    io.to(`user-${ride.riderId}`).emit('ride-started', { rideId: ride.id });
    res.json({ message: 'Ride started successfully', ride: updatedRide });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start ride' });
  }
};

export const completeRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const driverId = (req as any).user.userId;
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride || ride.driverId !== driverId) return res.status(403).json({ error: 'Not authorized' });
    if (ride.status !== RideStatus.IN_PROGRESS) return res.status(400).json({ error: 'Ride is not in progress' });

    const completedAt = new Date();
    const actualDuration = ride.startedAt ? Math.ceil((completedAt.getTime() - ride.startedAt.getTime()) / (1000 * 60)) : ride.estimatedDuration;
    const updatedRide = await prisma.ride.update({ where: { id: rideId }, data: { status: RideStatus.COMPLETED, completedAt, actualDistance: ride.estimatedDistance, actualDuration, actualFare: ride.estimatedFare } });

    const commission = updatedRide.actualFare! * parseFloat(process.env.COMMISSION_RATE || '0.15');
    const driverEarnings = updatedRide.actualFare! - commission;
    await prisma.payment.create({ data: { rideId: ride.id, userId: ride.riderId, amount: updatedRide.actualFare!, commission, driverEarnings, method: ride.paymentMethod, status: PaymentStatus.COMPLETED } });
    await prisma.driver.update({ where: { userId: driverId }, data: { isAvailable: true, completedRides: { increment: 1 }, totalEarnings: { increment: driverEarnings } } });
    await prisma.user.update({ where: { id: ride.riderId }, data: { totalRides: { increment: 1 } } });

    io.to(`user-${ride.riderId}`).emit('ride-completed', { rideId: ride.id });
    res.json({ message: 'Ride completed successfully', ride: updatedRide });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete ride' });
  }
};

export const getRideDetails = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const userId = (req as any).user.userId;
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: { select: { id: true, firstName: true, lastName: true, phoneNumber: true, profileImage: true, rating: true } },
        driver: { select: { id: true, firstName: true, lastName: true, phoneNumber: true, profileImage: true, rating: true, driverProfile: true } },
        payment: true, rating: true,
      },
    });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.riderId !== userId && ride.driverId !== userId) return res.status(403).json({ error: 'Not authorized' });
    res.json({ ride });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ride details' });
  }
};

export const getRideHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const rides = await prisma.ride.findMany({
      where: { OR: [{ riderId: userId }, { driverId: userId }], status: { in: [RideStatus.COMPLETED, RideStatus.CANCELLED] } },
      include: { rider: { select: { firstName: true, lastName: true, profileImage: true } }, driver: { select: { firstName: true, lastName: true, profileImage: true } } },
      orderBy: { createdAt: 'desc' }, skip, take: Number(limit),
    });
    const total = await prisma.ride.count({ where: { OR: [{ riderId: userId }, { driverId: userId }], status: { in: [RideStatus.COMPLETED, RideStatus.CANCELLED] } } });
    res.json({ rides, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ride history' });
  }
};

export const getNearbyDrivers = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, vehicleType, radius = 5 } = req.body;
    const drivers = await findNearbyDrivers(latitude, longitude, vehicleType, radius);
    res.json({ drivers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get nearby drivers' });
  }
};

export const calculateFare = async (req: Request, res: Response) => {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType } = req.body;
    const distance = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const duration = Math.ceil((distance / 40) * 60);
    const fareDetails = await calculateFareAmount(distance, duration, vehicleType);
    res.json({ distance, duration, fare: fareDetails });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate fare' });
  }
};

export const trackRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const userId = (req as any).user.userId;
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.riderId !== userId && ride.driverId !== userId) return res.status(403).json({ error: 'Not authorized' });
    res.json({ ride });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track ride' });
  }
};
