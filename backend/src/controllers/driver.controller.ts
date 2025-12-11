import { Request, Response } from 'express';
import Driver from '../models/Driver';
import User from '../models/User';
import Ride from '../models/Ride';
import Payment from '../models/Payment';
import paystackService from '../services/paystack.service';
import logger from '../utils/logger.util';

export const registerDriver = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      licensePlate,
      licenseNumber,
      licenseExpiry,
    } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ userId });
    if (existingDriver) {
      return res.status(400).json({ error: 'Driver profile already exists' });
    }

    // Get uploaded file paths
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const licensePhoto = files?.licensePhoto?.[0]?.path;
    const vehicleRegistration = files?.vehicleRegistration?.[0]?.path;
    const insurance = files?.insurance?.[0]?.path;
    const profilePhoto = files?.profilePhoto?.[0]?.path;

    // Create driver
    const driver = new Driver({
      userId,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      licensePlate,
      documents: {
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        licensePhoto,
        vehicleRegistration,
        insurance,
        profilePhoto,
      },
      verificationStatus: 'PENDING',
      isApproved: false,
    });

    await driver.save();

    // Update user role
    await User.findByIdAndUpdate(userId, { role: 'DRIVER' });

    res.status(201).json({
      success: true,
      message: 'Driver registration submitted. Awaiting admin approval.',
      driver: {
        id: driver._id,
        verificationStatus: driver.verificationStatus,
      },
    });
  } catch (error: any) {
    logger.error('Register driver failed', error);
    res.status(500).json({ error: 'Failed to register driver', details: error.message });
  }
};

export const getDriverProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const driver = await Driver.findOne({ userId }).populate('userId', 'firstName lastName phoneNumber profilePhoto rating');
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    res.json({
      success: true,
      driver,
    });
  } catch (error: any) {
    logger.error('Get driver profile failed', error);
    res.status(500).json({ error: 'Failed to get driver profile', details: error.message });
  }
};

export const updateDriverStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { isOnline } = req.body;

    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    if (!driver.isApproved) {
      return res.status(403).json({ error: 'Driver not approved yet' });
    }

    driver.isOnline = isOnline;
    if (isOnline) {
      driver.lastOnline = new Date();
    }
    
    await driver.save();

    res.json({
      success: true,
      message: `Driver is now ${isOnline ? 'online' : 'offline'}`,
      isOnline: driver.isOnline,
    });
  } catch (error: any) {
    console.error('Update driver status error:', error);
    res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { latitude, longitude, heading } = req.body;

    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    driver.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    
    if (heading !== undefined) {
      driver.heading = heading;
    }

    driver.lastOnline = new Date();
    await driver.save();

    res.json({
      success: true,
      message: 'Location updated',
    });
  } catch (error: any) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location', details: error.message });
  }
};

export const getEarnings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { period = 'today' } = req.query; // today, week, month, all

    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    // Calculate date range
    let startDate: Date;
    const now = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get completed rides in period
    const rides = await Ride.find({
      driverId: driver._id,
      status: 'COMPLETED',
      completedAt: { $gte: startDate },
    }).select('driverEarnings completedAt distance');

    const totalEarnings = rides.reduce((sum, ride) => sum + (ride.driverEarnings || 0), 0);
    const totalRides = rides.length;
    const totalDistance = rides.reduce((sum, ride) => sum + ride.distance, 0);

    res.json({
      success: true,
      earnings: {
        period,
        totalEarnings,
        totalRides,
        totalDistance,
        averagePerRide: totalRides > 0 ? totalEarnings / totalRides : 0,
        pendingBalance: driver.pendingEarnings,
        availableBalance: driver.availableBalance,
        rides,
      },
    });
  } catch (error: any) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Failed to get earnings', details: error.message });
  }
};

export const getDriverStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    res.json({
      success: true,
      stats: {
        rating: driver.rating,
        totalRides: driver.totalRides,
        completedRides: driver.completedRides,
        cancelledRides: driver.cancelledRides,
        acceptanceRate: driver.acceptanceRate,
        totalEarnings: driver.totalEarnings,
        pendingEarnings: driver.pendingEarnings,
        availableBalance: driver.availableBalance,
      },
    });
  } catch (error: any) {
    console.error('Get driver stats error:', error);
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
};

export const updateBankDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { bankName, accountNumber, accountName } = req.body;

    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    // Verify account with Paystack (optional but recommended)
    // const bankCode = getBankCode(bankName); // You'd need a mapping function
    // const verification = await paystackService.resolveAccountNumber(accountNumber, bankCode);

    driver.bankDetails = {
      bankName,
      accountNumber,
      accountName,
    };

    await driver.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      bankDetails: driver.bankDetails,
    });
  } catch (error: any) {
    console.error('Update bank details error:', error);
    res.status(500).json({ error: 'Failed to update bank details', details: error.message });
  }
};

export const requestPayout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { amount } = req.body;

    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    if (!driver.bankDetails || !driver.bankDetails.accountNumber) {
      return res.status(400).json({ error: 'Please add bank details first' });
    }

    if (amount > driver.availableBalance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    if (amount < 1000) {
      return res.status(400).json({ error: 'Minimum payout is ₦1,000' });
    }

    // Create transfer recipient (if not exists)
    // const recipientResult = await paystackService.createTransferRecipient(
    //   driver.bankDetails.accountNumber,
    //   bankCode,
    //   driver.bankDetails.accountName
    // );

    // Initiate transfer
    const reference = `payout_${driver._id}_${Date.now()}`;
    // const transferResult = await paystackService.initiateTransfer(
    //   recipientCode,
    //   amount,
    //   reference,
    //   'Driver earnings payout'
    // );

    // Update driver balance
    driver.availableBalance -= amount;
    await driver.save();

    // Create payment record
    const payment = new Payment({
      userId,
      driverId: driver._id,
      amount,
      currency: 'NGN',
      method: 'PAYSTACK',
      status: 'PROCESSING',
      paystackReference: reference,
    });
    await payment.save();

    res.json({
      success: true,
      message: 'Payout request submitted',
      payment: {
        id: payment._id,
        amount,
        status: payment.status,
        reference,
      },
    });
  } catch (error: any) {
    console.error('Request payout error:', error);
    res.status(500).json({ error: 'Failed to request payout', details: error.message });
  }
};

export const getRideHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 20 } = req.query;

    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    const rides = await Ride.find({ driverId: driver._id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('riderId', 'firstName lastName phoneNumber rating');

    const total = await Ride.countDocuments({ driverId: driver._id });

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
