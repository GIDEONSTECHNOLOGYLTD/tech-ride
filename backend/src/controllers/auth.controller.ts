import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { sendSMS } from '../utils/sms.util';
import { generateOTP } from '../utils/otp.util';

const prisma = new PrismaClient();

// Temporary OTP storage (use Redis in production)
const otpStore: Map<string, { otp: string; expires: number }> = new Map();

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phoneNumber }, { email: email || undefined }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    // Generate and send OTP
    const otp = generateOTP();
    otpStore.set(phoneNumber, {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await sendSMS(phoneNumber, `Your verification code is: ${otp}`);

    res.status(201).json({
      message: 'User registered successfully. Please verify your phone number.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
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
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: { driverProfile: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your phone number first' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImage: user.profileImage,
        rating: user.rating,
        walletBalance: user.walletBalance,
        isDriver: !!user.driverProfile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, otp } = req.body;

    const storedOTP = otpStore.get(phoneNumber);
    if (!storedOTP) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    if (storedOTP.expires < Date.now()) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Verify user
    const user = await prisma.user.update({
      where: { phoneNumber },
      data: { isVerified: true },
    });

    otpStore.delete(phoneNumber);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Phone number verified successfully',
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate and send new OTP
    const otp = generateOTP();
    otpStore.set(phoneNumber, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    });

    await sendSMS(phoneNumber, `Your verification code is: ${otp}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const newToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
