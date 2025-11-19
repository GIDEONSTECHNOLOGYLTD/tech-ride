import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  role: 'RIDER' | 'DRIVER' | 'ADMIN';
  isVerified: boolean;
  profilePhoto?: string;
  
  // Wallet - Multi-currency support
  walletBalance: number;
  walletCurrency: 'NGN' | 'USDT' | 'BTC' | 'ETH';
  cryptoWallet?: {
    btcAddress?: string;
    ethAddress?: string;
    usdtAddress?: string;
  };
  
  // Location
  lastKnownLocation?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  
  // Preferences
  preferredLanguage: 'en' | 'yo' | 'ig' | 'ha' | 'fr'; // English, Yoruba, Igbo, Hausa, French
  rating: number;
  totalRides: number;
  
  // Referral System
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referralEarnings: number;
  referralCount: number;
  
  // Authentication
  otp?: string;
  otpExpiry?: Date;
  refreshToken?: string;
  fcmToken?: string; // Firebase Cloud Messaging for push notifications
  
  // Metadata
  isActive: boolean;
  isBlocked: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateReferralCode(): string;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true, trim: true },
  email: { type: String, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ['RIDER', 'DRIVER', 'ADMIN'], 
    default: 'RIDER' 
  },
  isVerified: { type: Boolean, default: false },
  profilePhoto: String,
  
  walletBalance: { type: Number, default: 0, min: 0 },
  walletCurrency: { 
    type: String, 
    enum: ['NGN', 'USDT', 'BTC', 'ETH'], 
    default: 'NGN' 
  },
  cryptoWallet: {
    btcAddress: { type: String, trim: true },
    ethAddress: { type: String, trim: true },
    usdtAddress: { type: String, trim: true },
  },
  
  lastKnownLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  
  preferredLanguage: { 
    type: String, 
    enum: ['en', 'yo', 'ig', 'ha', 'fr'], 
    default: 'en' 
  },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  totalRides: { type: Number, default: 0, min: 0 },
  
  referralCode: { type: String, unique: true, uppercase: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  referralEarnings: { type: Number, default: 0, min: 0 },
  referralCount: { type: Number, default: 0, min: 0 },
  
  otp: String,
  otpExpiry: Date,
  refreshToken: String,
  fcmToken: String,
  
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ lastKnownLocation: '2dsphere' });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ referralCode: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  
  // Generate referral code if not exists
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate unique referral code
UserSchema.methods.generateReferralCode = function(): string {
  const prefix = 'TR';
  const nameCode = this.firstName.substring(0, 2).toUpperCase();
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${nameCode}${randomCode}`;
};

export default mongoose.model<IUser>('User', UserSchema);
