import { Request, Response } from 'express';
import User from '../models/User';
import Driver from '../models/Driver';
import Ride from '../models/Ride';
import Payment from '../models/Payment';
import PromoCode from '../models/PromoCode';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total counts
    const totalUsers = await User.countDocuments({ role: 'RIDER' });
    const totalDrivers = await Driver.countDocuments();
    const totalRides = await Ride.countDocuments();
    const activeRides = await Ride.countDocuments({ status: { $in: ['PENDING', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] } });

    // Today's stats
    const todayRides = await Ride.countDocuments({ createdAt: { $gte: today } });
    const todayRevenue = await Payment.aggregate([
      { $match: { createdAt: { $gte: today }, status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$platformCommission' } } }
    ]);

    // Monthly stats
    const monthlyRides = await Ride.countDocuments({ createdAt: { $gte: thisMonth } });
    const monthlyRevenue = await Payment.aggregate([
      { $match: { createdAt: { $gte: thisMonth }, status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$platformCommission' } } }
    ]);

    // Pending approvals
    const pendingDrivers = await Driver.countDocuments({ verificationStatus: 'PENDING' });

    // Online drivers
    const onlineDrivers = await Driver.countDocuments({ isOnline: true });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        totalRides,
        activeRides,
        onlineDrivers,
        pendingDrivers,
        today: {
          rides: todayRides,
          revenue: todayRevenue[0]?.total || 0,
        },
        thisMonth: {
          rides: monthlyRides,
          revenue: monthlyRevenue[0]?.total || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats', details: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search, role } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users', details: error.message });
  }
};

export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query: any = {};
    if (status) {
      query.verificationStatus = status;
    }

    const drivers = await Driver.find(query)
      .populate('userId', 'firstName lastName phoneNumber email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Driver.countDocuments(query);

    res.json({
      success: true,
      drivers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get all drivers error:', error);
    res.status(500).json({ error: 'Failed to get drivers', details: error.message });
  }
};

export const getPendingDrivers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const drivers = await Driver.find({ verificationStatus: 'PENDING' })
      .populate('userId', 'firstName lastName phoneNumber email')
      .sort({ createdAt: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Driver.countDocuments({ verificationStatus: 'PENDING' });

    res.json({
      success: true,
      drivers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get pending drivers error:', error);
    res.status(500).json({ error: 'Failed to get pending drivers', details: error.message });
  }
};

export const approveDriver = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    driver.verificationStatus = 'APPROVED';
    driver.isApproved = true;
    await driver.save();

    res.json({
      success: true,
      message: 'Driver approved successfully',
      driver: {
        id: driver._id,
        verificationStatus: driver.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error('Approve driver error:', error);
    res.status(500).json({ error: 'Failed to approve driver', details: error.message });
  }
};

export const rejectDriver = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const { reason } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    driver.verificationStatus = 'REJECTED';
    driver.isApproved = false;
    driver.rejectionReason = reason;
    await driver.save();

    res.json({
      success: true,
      message: 'Driver rejected',
      driver: {
        id: driver._id,
        verificationStatus: driver.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error('Reject driver error:', error);
    res.status(500).json({ error: 'Failed to reject driver', details: error.message });
  }
};

export const getAllRides = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, status } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate('riderId', 'firstName lastName phoneNumber')
      .populate({
        path: 'driverId',
        populate: {
          path: 'userId',
          select: 'firstName lastName phoneNumber',
        },
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

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
    console.error('Get all rides error:', error);
    res.status(500).json({ error: 'Failed to get rides', details: error.message });
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBlocked = true;
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User blocked successfully',
    });
  } catch (error: any) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Failed to block user', details: error.message });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBlocked = false;
    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User unblocked successfully',
    });
  } catch (error: any) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Failed to unblock user', details: error.message });
  }
};

export const createPromoCode = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.userId;
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      startDate,
      endDate,
      maxUsageTotal,
      maxUsagePerUser,
      minRideAmount,
      applicableVehicleTypes,
      applicableToNewUsersOnly,
    } = req.body;

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxUsageTotal,
      maxUsagePerUser: maxUsagePerUser || 1,
      minRideAmount,
      applicableVehicleTypes,
      applicableToNewUsersOnly: applicableToNewUsersOnly || false,
      createdBy: adminId,
    });

    await promoCode.save();

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      promoCode,
    });
  } catch (error: any) {
    console.error('Create promo code error:', error);
    res.status(500).json({ error: 'Failed to create promo code', details: error.message });
  }
};

export const getPromoCodes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, active } = req.query;

    const query: any = {};
    if (active === 'true') {
      query.isActive = true;
      query.endDate = { $gte: new Date() };
    }

    const promoCodes = await PromoCode.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await PromoCode.countDocuments(query);

    res.json({
      success: true,
      promoCodes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ error: 'Failed to get promo codes', details: error.message });
  }
};

export const getRevenue = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const query: any = { status: 'COMPLETED' };
    if (startDate) {
      query.createdAt = { $gte: new Date(startDate as string) };
    }
    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate as string) };
    }

    const revenueData = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$platformCommission' },
          totalDriverEarnings: { $sum: '$driverEarnings' },
          totalGMV: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      revenue: revenueData[0] || {
        totalRevenue: 0,
        totalDriverEarnings: 0,
        totalGMV: 0,
        count: 0,
      },
    });
  } catch (error: any) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Failed to get revenue', details: error.message });
  }
};
