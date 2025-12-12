import { Request, Response } from 'express';
import Driver from '../models/Driver';
import User from '../models/User';
import Ride from '../models/Ride';
import Payment from '../models/Payment';
import paystackService from '../services/paystack.service';
import logger from '../utils/logger.util';
import { getBankCode } from '../utils/banks.util';

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
        licensePhoto: licensePhoto ? {
          url: licensePhoto,
          uploadedAt: new Date(),
          verified: false,
        } : undefined,
        vehicleRegistration: vehicleRegistration ? {
          url: vehicleRegistration,
          uploadedAt: new Date(),
          verified: false,
        } : undefined,
        insurance: insurance ? {
          url: insurance,
          uploadedAt: new Date(),
          verified: false,
        } : undefined,
        profilePhoto: profilePhoto ? {
          url: profilePhoto,
          uploadedAt: new Date(),
          verified: false,
        } : undefined,
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

    // Validate account number format
    if (!/^\d{10}$/.test(accountNumber)) {
      return res.status(400).json({ error: 'Account number must be 10 digits' });
    }

    // Get bank code
    const bankCode = getBankCode(bankName);
    if (!bankCode) {
      return res.status(400).json({ 
        error: 'Invalid bank name',
        message: 'Please select a valid Nigerian bank',
      });
    }

    // Verify account with Paystack
    try {
      const verification = await paystackService.resolveAccountNumber(accountNumber, bankCode);
      
      if (!verification.success) {
        return res.status(400).json({ 
          error: 'Account verification failed',
          details: verification.error,
        });
      }

      // Use verified account name from Paystack
      const verifiedAccountName = verification.accountName || accountName;

      driver.bankDetails = {
        bankName,
        bankCode,
        accountNumber,
        accountName: verifiedAccountName,
      };
    } catch (verifyError: any) {
      // If verification fails, save anyway but warn user
      logger.warn('Bank account verification failed', verifyError);
      driver.bankDetails = {
        bankName,
        bankCode,
        accountNumber,
        accountName,
      };
    }

    await driver.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      bankDetails: driver.bankDetails,
    });
  } catch (error: any) {
    logger.error('Update bank details error', error);
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
      return res.status(400).json({ 
        error: 'Insufficient balance',
        availableBalance: driver.availableBalance,
        requestedAmount: amount,
      });
    }

    if (amount < 1000) {
      return res.status(400).json({ error: 'Minimum payout is ₦1,000' });
    }

    const reference = `payout_${driver._id}_${Date.now()}`;

    // Get bank code from bank name
    const bankCode = getBankCode(driver.bankDetails.bankName);
    
    if (!bankCode) {
      return res.status(400).json({ 
        error: 'Invalid bank name',
        message: 'Bank not supported. Please update bank details with a valid Nigerian bank.',
      });
    }
    
    // FIXED: Uncommented Paystack integration
    try {
      // Create transfer recipient if not already exists
      let recipientCode = driver.paystackRecipientCode;
      
      if (!recipientCode) {
        const recipientResult = await paystackService.createTransferRecipient(
          driver.bankDetails.accountNumber,
          bankCode,
          driver.bankDetails.accountName
        );

        if (!recipientResult.success) {
          return res.status(400).json({ 
            error: 'Failed to create recipient',
            details: recipientResult.error,
          });
        }

        recipientCode = recipientResult.recipientCode;
        // Store recipient code for future payouts
        driver.paystackRecipientCode = recipientCode;
        await driver.save();
      }

      // Initiate transfer to driver's bank account
      const transferResult = await paystackService.initiateTransfer(
        recipientCode,
        amount,
        reference,
        'Driver earnings payout'
      );

      if (!transferResult.success) {
        return res.status(400).json({ 
          error: 'Transfer failed',
          details: transferResult.error,
        });
      }

      // Deduct from available balance only after successful transfer initiation
      driver.availableBalance -= amount;
      driver.pendingEarnings -= amount;  // Also reduce pending
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
        message: 'Payout initiated successfully',
        payment: {
          id: payment._id,
          amount,
          status: payment.status,
          reference,
          estimatedArrival: '10-30 minutes',
        },
        newBalance: driver.availableBalance,
      });
    } catch (paystackError: any) {
      logger.error('Paystack transfer error', paystackError);
      return res.status(500).json({ 
        error: 'Payout processing failed',
        details: paystackError.message,
      });
    }
  } catch (error: any) {
    logger.error('Request payout error', error);
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

export const updateDocuments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    // Get uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Update documents that were uploaded
    if (files?.licensePhoto?.[0]) {
      driver.documents.licensePhoto = {
        url: files.licensePhoto[0].path,
        uploadedAt: new Date(),
        verified: false,
      };
    }

    if (files?.vehicleRegistration?.[0]) {
      driver.documents.vehicleRegistration = {
        url: files.vehicleRegistration[0].path,
        uploadedAt: new Date(),
        verified: false,
      };
    }

    if (files?.insurance?.[0]) {
      driver.documents.insurance = {
        url: files.insurance[0].path,
        uploadedAt: new Date(),
        verified: false,
      };
    }

    if (files?.profilePhoto?.[0]) {
      driver.documents.profilePhoto = {
        url: files.profilePhoto[0].path,
        uploadedAt: new Date(),
        verified: false,
      };
    }

    await driver.save();

    res.json({
      success: true,
      message: 'Documents updated successfully',
      documents: driver.documents,
    });
  } catch (error: any) {
    logger.error('Update documents failed', error);
    res.status(500).json({ error: 'Failed to update documents', details: error.message });
  }
};
