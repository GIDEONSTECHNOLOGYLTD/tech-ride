import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyOTP,
  resendOTP,
  refreshToken,
} from '../controllers/auth.controller';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('phoneNumber').isMobilePhone('any').withMessage('Invalid phone number'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['RIDER', 'DRIVER']).withMessage('Invalid role'),
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('phoneNumber').isMobilePhone('any').withMessage('Invalid phone number'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('phoneNumber').isMobilePhone('any').withMessage('Invalid phone number'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  verifyOTP
);

// Resend OTP
router.post(
  '/resend-otp',
  [body('phoneNumber').isMobilePhone('any').withMessage('Invalid phone number')],
  resendOTP
);

// Refresh token
router.post('/refresh-token', refreshToken);

export default router;
