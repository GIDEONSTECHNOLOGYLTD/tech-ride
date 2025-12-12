import { Request, Response } from 'express';
import User from '../models/User';
import Driver from '../models/Driver';
import Ride from '../models/Ride';
import Payment from '../models/Payment';
import Notification from '../models/Notification';
import paystackService from '../services/paystack.service';
import cryptoService from '../services/crypto.service';
import logger from '../utils/logger.util';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select('-password -otp -otpExpiry -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile', details: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { firstName, lastName, email, profilePhoto, preferredLanguage } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePhoto: user.profilePhoto,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
};

export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select('walletBalance walletCurrency cryptoWallet');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent transactions
    const recentPayments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount currency method status createdAt');

    res.json({
      success: true,
      wallet: {
        balance: user.walletBalance,
        currency: user.walletCurrency,
        cryptoWallets: user.cryptoWallet,
      },
      recentTransactions: recentPayments,
    });
  } catch (error: any) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Failed to get wallet', details: error.message });
  }
};

export const topupWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { amount, method } = req.body; // method: 'PAYSTACK' or 'CRYPTO'

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (method === 'PAYSTACK') {
      // Initialize Paystack transaction
      const reference = `topup_${userId}_${Date.now()}`;
      const result = await paystackService.initializeTransaction(
        user.email || user.phoneNumber,
        amount,
        reference,
        {
          userId: user._id,
          type: 'wallet_topup',
        }
      );

      if (result.success) {
        res.json({
          success: true,
          message: 'Payment initialized',
          paymentUrl: result.data.authorization_url,
          reference: result.data.reference,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } else if (method === 'CRYPTO') {
      // Return crypto wallet addresses for user to send to
      res.json({
        success: true,
        message: 'Send crypto to one of these addresses',
        wallets: {
          USDT: process.env.CRYPTO_WALLET_USDT,
          BTC: process.env.CRYPTO_WALLET_BTC,
          ETH: process.env.CRYPTO_WALLET_ETH,
        },
        instructions: 'After sending, provide the transaction hash for verification',
      });
    } else {
      res.status(400).json({ error: 'Invalid payment method' });
    }
  } catch (error: any) {
    console.error('Topup wallet error:', error);
    res.status(500).json({ error: 'Failed to topup wallet', details: error.message });
  }
};

export const addCryptoWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { btcAddress, ethAddress, usdtAddress } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.cryptoWallet) {
      user.cryptoWallet = {};
    }

    if (btcAddress) user.cryptoWallet.btcAddress = btcAddress;
    if (ethAddress) user.cryptoWallet.ethAddress = ethAddress;
    if (usdtAddress) user.cryptoWallet.usdtAddress = usdtAddress;

    await user.save();

    res.json({
      success: true,
      message: 'Crypto wallets updated successfully',
      cryptoWallet: user.cryptoWallet,
    });
  } catch (error: any) {
    console.error('Add crypto wallet error:', error);
    res.status(500).json({ error: 'Failed to add crypto wallet', details: error.message });
  }
};

export const topUpWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { amount, method } = req.body;  // method: 'PAYSTACK' or 'CRYPTO'

    if (!amount || amount < 5) {
      return res.status(400).json({ error: 'Minimum top-up amount is ₦5' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (method === 'PAYSTACK') {
      const reference = `wallet_topup_${userId}_${Date.now()}`;
      
      const result = await paystackService.initializeTransaction(
        user.email || user.phoneNumber,
        amount,
        reference,
        {
          userId: user._id,
          type: 'wallet_topup',
          amount,
        }
      );

      if (result.success) {
        // Create payment record for tracking
        const payment = new Payment({
          userId,
          amount,
          currency: 'NGN',
          method: 'PAYSTACK',
          status: 'PENDING',
          paystackReference: reference,
          baseFare: 0,
          surgeCharge: 0,
          discount: 0,
          platformCommission: 0,
          driverEarnings: 0,
        });
        await payment.save();

        res.json({
          success: true,
          message: 'Payment initialized',
          paymentUrl: result.data.authorization_url,
          reference,
          amount,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } else if (method === 'CRYPTO') {
      // Get crypto prices
      const prices = await cryptoService.getCryptoPrices();
      
      if (!prices.success) {
        return res.status(500).json({ error: 'Failed to get crypto prices' });
      }

      res.json({
        success: true,
        message: 'Send crypto to wallet address',
        wallets: {
          BTC: process.env.CRYPTO_WALLET_BTC,
          ETH: process.env.CRYPTO_WALLET_ETH,
          USDT: process.env.CRYPTO_WALLET_USDT,
        },
        amounts: {
          BTC: cryptoService.convertNgnToCrypto(amount, prices.prices.BTC),
          ETH: cryptoService.convertNgnToCrypto(amount, prices.prices.ETH),
          USDT: cryptoService.convertNgnToCrypto(amount, prices.prices.USDT),
        },
        ngnAmount: amount,
      });
    } else {
      res.status(400).json({ error: 'Invalid top-up method' });
    }
  } catch (error: any) {
    logger.error('Wallet top-up failed', error);
    res.status(500).json({ error: 'Failed to initialize wallet top-up', details: error.message });
  }
};

export const verifyWalletTopUp = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const userId = (req as any).user.userId;

    const payment = await Payment.findOne({ paystackReference: reference });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'COMPLETED') {
      return res.json({
        success: true,
        message: 'Payment already processed',
        payment: {
          amount: payment.amount,
          status: payment.status,
        },
      });
    }

    // Verify with Paystack
    const result = await paystackService.verifyTransaction(reference);

    if (result.success) {
      // Add money to wallet
      const user = await User.findById(userId);
      if (user) {
        user.walletBalance += payment.amount;
        await user.save();

        payment.status = 'COMPLETED';
        await payment.save();

        res.json({
          success: true,
          message: 'Wallet topped up successfully',
          newBalance: user.walletBalance,
          amountAdded: payment.amount,
        });
      }
    } else {
      payment.status = 'FAILED';
      payment.failureReason = result.error;
      await payment.save();

      res.status(400).json({ error: 'Payment verification failed', details: result.error });
    }
  } catch (error: any) {
    logger.error('Verify wallet top-up failed', error);
    res.status(500).json({ error: 'Failed to verify wallet top-up', details: error.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query: any = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications', details: error.message });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = (req as any).user.userId;

    const notification = await Notification.findOne({ _id: notificationId, userId });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification', details: error.message });
  }
};

export const getSavedPlaces = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // This would typically be a separate SavedPlace model
    // For now, return empty array
    res.json({
      success: true,
      places: [],
    });
  } catch (error: any) {
    console.error('Get saved places error:', error);
    res.status(500).json({ error: 'Failed to get saved places', details: error.message });
  }
};

export const updateFCMToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { fcmToken } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.fcmToken = fcmToken;
    await user.save();

    res.json({
      success: true,
      message: 'FCM token updated successfully',
    });
  } catch (error: any) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ error: 'Failed to update FCM token', details: error.message });
  }
};

export const getReferralInfo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select('referralCode referralEarnings referralCount');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get referrals
    const referrals = await User.find({ referredBy: userId })
      .select('firstName lastName phoneNumber createdAt totalRides')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      referralInfo: {
        code: user.referralCode,
        totalEarnings: user.referralEarnings,
        totalReferrals: user.referralCount,
        referrals,
      },
    });
  } catch (error: any) {
    console.error('Get referral info error:', error);
    res.status(500).json({ error: 'Failed to get referral info', details: error.message });
  }
};

export const getNearbyDrivers = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);

    // Find nearby online drivers using geospatial query
    const drivers = await Driver.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusKm * 1000, // Convert km to meters
        },
      },
      isOnline: true,
      isAvailable: true,
      isApproved: true,
    })
      .limit(20)
      .populate('userId', 'firstName lastName phoneNumber rating profilePhoto');

    res.json({
      success: true,
      drivers,
      count: drivers.length,
    });
  } catch (error: any) {
    console.error('Get nearby drivers error:', error);
    res.status(500).json({ error: 'Failed to get nearby drivers', details: error.message });
  }
};
