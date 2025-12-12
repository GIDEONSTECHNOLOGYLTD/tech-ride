import { Request, Response } from 'express';
import crypto from 'crypto';
import Payment from '../models/Payment';
import User from '../models/User';
import Ride from '../models/Ride';
import paystackService from '../services/paystack.service';
import cryptoService from '../services/crypto.service';
import logger from '../utils/logger.util';

export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { rideId, amount, method } = req.body;
    const userId = (req as any).user.userId;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (method === 'PAYSTACK') {
      const reference = `ride_${rideId}_${Date.now()}`;
      const result = await paystackService.initializeTransaction(
        user.email || user.phoneNumber,
        amount,
        reference,
        {
          rideId,
          userId: user._id,
        }
      );

      if (result.success) {
        // Create payment record
        const payment = new Payment({
          rideId,
          userId,
          driverId: ride.driverId,
          amount,
          currency: 'NGN',
          method: 'PAYSTACK',
          status: 'PENDING',
          paystackReference: reference,
          baseFare: ride.baseFare,
          surgeCharge: (amount - ride.baseFare),
          discount: ride.discount,
          platformCommission: amount * ride.platformCommission,
          driverEarnings: amount * (1 - ride.platformCommission),
        });

        await payment.save();

        res.json({
          success: true,
          paymentUrl: result.data.authorization_url,
          reference,
          paymentId: payment._id,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } else if (method === 'WALLET') {
      // Process wallet payment IMMEDIATELY (not at ride completion)
      if (user.walletBalance < amount) {
        return res.status(400).json({ 
          error: 'Insufficient wallet balance',
          required: amount,
          available: user.walletBalance,
        });
      }

      // Deduct wallet balance NOW to prevent multiple rides with insufficient funds
      user.walletBalance -= amount;
      await user.save();

      const payment = new Payment({
        rideId,
        userId,
        driverId: ride.driverId,
        amount,
        currency: user.walletCurrency,
        method: 'WALLET',
        status: 'COMPLETED',  // Mark as completed immediately since funds are deducted
        baseFare: ride.baseFare,
        surgeCharge: (amount - ride.baseFare),
        discount: ride.discount,
        platformCommission: amount * ride.platformCommission,
        driverEarnings: amount * (1 - ride.platformCommission),
      });

      await payment.save();

      ride.paymentStatus = 'COMPLETED';
      await ride.save();

      res.json({
        success: true,
        message: 'Payment successful - Wallet charged',
        payment: {
          id: payment._id,
          status: payment.status,
          newBalance: user.walletBalance,
          amountCharged: amount,
        },
      });
    } else if (method === 'CRYPTO') {
      // Get crypto prices
      const prices = await cryptoService.getCryptoPrices();
      
      if (!prices.success) {
        return res.status(500).json({ error: 'Failed to get crypto prices' });
      }

      res.json({
        success: true,
        message: 'Send crypto to complete payment',
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
        instructions: 'Send exact amount and provide transaction hash for verification',
      });
    } else if (method === 'CASH') {
      // Cash payment - mark as pending until driver confirms
      const payment = new Payment({
        rideId,
        userId,
        driverId: ride.driverId,
        amount,
        currency: 'NGN',
        method: 'CASH',
        status: 'PENDING',
        baseFare: ride.baseFare,
        surgeCharge: (amount - ride.baseFare),
        discount: ride.discount,
        platformCommission: amount * ride.platformCommission,
        driverEarnings: amount * (1 - ride.platformCommission),
      });

      await payment.save();

      res.json({
        success: true,
        message: 'Cash payment registered',
        payment: {
          id: payment._id,
          amount,
          instructions: 'Pay cash to driver at end of ride',
        },
      });
    } else {
      res.status(400).json({ error: 'Invalid payment method' });
    }
  } catch (error: any) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ error: 'Failed to initialize payment', details: error.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ paystackReference: reference });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify with Paystack
    const result = await paystackService.verifyTransaction(reference);

    if (result.success) {
      payment.status = 'COMPLETED';
      payment.paystackStatus = result.data.status;
      await payment.save();

      // Update ride payment status
      await Ride.findByIdAndUpdate(payment.rideId, {
        paymentStatus: 'COMPLETED',
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
        },
      });
    } else {
      payment.status = 'FAILED';
      payment.failureReason = result.error;
      await payment.save();

      res.status(400).json({ error: 'Payment verification failed', details: result.error });
    }
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment', details: error.message });
  }
};

export const verifyCryptoPayment = async (req: Request, res: Response) => {
  try {
    const { txHash, crypto, rideId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    let verification;
    const expectedAmount = ride.estimatedFare;

    // Verify based on crypto type
    switch (crypto) {
      case 'BTC':
        verification = await cryptoService.verifyBtcTransaction(
          txHash,
          expectedAmount,
          process.env.CRYPTO_WALLET_BTC || ''
        );
        break;
      case 'ETH':
        verification = await cryptoService.verifyEthTransaction(
          txHash,
          expectedAmount,
          process.env.CRYPTO_WALLET_ETH || ''
        );
        break;
      case 'USDT':
        verification = await cryptoService.verifyTronTransaction(
          txHash,
          expectedAmount,
          process.env.CRYPTO_WALLET_USDT || ''
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid crypto type' });
    }

    if (verification.success && verification.confirmed) {
      // Create payment record
      const payment = new Payment({
        rideId,
        userId: ride.riderId,
        driverId: ride.driverId,
        amount: expectedAmount,
        currency: crypto,
        method: 'CRYPTO',
        status: 'COMPLETED',
        cryptoDetails: {
          network: crypto === 'USDT' ? 'TRON' : crypto,
          txHash,
          confirmations: verification.confirmations,
        },
        baseFare: ride.baseFare,
        platformCommission: expectedAmount * ride.platformCommission,
        driverEarnings: expectedAmount * (1 - ride.platformCommission),
      });

      await payment.save();

      ride.paymentStatus = 'COMPLETED';
      await ride.save();

      res.json({
        success: true,
        message: 'Crypto payment verified',
        payment: {
          id: payment._id,
          txHash,
          confirmations: verification.confirmations,
        },
      });
    } else {
      res.status(400).json({
        error: 'Payment verification failed',
        details: verification.error,
      });
    }
  } catch (error: any) {
    logger.error('Verify crypto payment failed', error);
    res.status(500).json({ error: 'Failed to verify crypto payment', details: error.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;

    // Verify webhook signature
    const signature = req.headers['x-paystack-signature'] as string;
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    
    const hash = crypto.createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (hash !== signature) {
      logger.warn('Invalid webhook signature', { signature });
      return res.status(401).json({ error: 'Invalid signature' });
    }

    if (event.event === 'charge.success') {
      const { reference } = event.data;

      const payment = await Payment.findOne({ paystackReference: reference });
      if (payment) {
        payment.status = 'COMPLETED';
        payment.paystackStatus = event.data.status;
        await payment.save();

        // Update ride
        await Ride.findByIdAndUpdate(payment.rideId, {
          paymentStatus: 'COMPLETED',
        });

        logger.info('Payment webhook processed', { reference, paymentId: payment._id });
      }
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error('Webhook processing failed', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 20 } = req.query;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('rideId', 'pickupLocation dropoffLocation status');

    const total = await Payment.countDocuments({ userId });

    res.json({
      success: true,
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    logger.error('Get payment history failed', error);
    res.status(500).json({ error: 'Failed to get payment history', details: error.message });
  }
};
