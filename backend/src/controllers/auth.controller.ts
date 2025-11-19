import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { sendSMS } from '../utils/sms.util';
import { generateOTP } from '../utils/otp.util';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, email, password, firstName, lastName, role, referralCode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ phoneNumber }, { email: email || null }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check referral code if provided
    let referredBy;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Create user (password will be hashed by pre-save hook)
    const user = new User({
      phoneNumber,
      email,
      password,
      firstName,
      lastName,
      role: role || 'RIDER',
      referredBy,
    });

    await user.save();

    // Generate and send OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via SMS
    await sendSMS(phoneNumber, `Your TechRide verification code is: ${otp}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your phone number.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, password } = req.body;

    // Find user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePhoto: user.profilePhoto,
        rating: user.rating,
        walletBalance: user.walletBalance,
        walletCurrency: user.walletCurrency,
        preferredLanguage: user.preferredLanguage,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ error: 'No OTP request found' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Handle referral bonus if user was referred
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const referrerReward = parseInt(process.env.REFERRER_REWARD || '1000');
        const referredUserReward = parseInt(process.env.REFERRED_USER_REWARD || '500');

        // Credit referrer
        referrer.walletBalance += referrerReward;
        referrer.referralEarnings += referrerReward;
        referrer.referralCount += 1;
        await referrer.save();

        // Credit new user
        user.walletBalance += referredUserReward;
        await user.save();

        // Create referral record (you'll need to implement this)
        console.log(`Referral bonus: ${referrerReward} to ${referrer.phoneNumber}, ${referredUserReward} to ${user.phoneNumber}`);
      }
    }

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      user: {
        id: user._id,
        isVerified: user.isVerified,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP
    await sendSMS(phoneNumber, `Your TechRide verification code is: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP', details: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed', details: error.message });
  }
};
