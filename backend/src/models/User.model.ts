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
  
  // Wallet
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
  preferredLanguage: 'en' | 'yo' | 'ig' | 'ha' | 'fr';
  rating: number;
  totalRides: number;
  
  // Referral
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referralEarnings: number;
  
  // Authentication
  otp?: string;
  otpExpiry?: Date;
  refreshToken?: string;
  fcmToken?: string; // For push notifications
  
  // Metadata
  isActive: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateReferralCode(): string;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, sparse: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['RIDER', 'DRIVER', 'ADMIN'], 
    default: 'RIDER' 
  },
  isVerified: { type: Boolean, default: false },
  profilePhoto: String,
  
  walletBalance: { type: Number, default: 0 },
  walletCurrency: { 
    type: String, 
    enum: ['NGN', 'USDT', 'BTC', 'ETH'], 
    default: 'NGN' 
  },
  cryptoWallet: {
    btcAddress: String,
    ethAddress: String,
    usdtAddress: String,
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
  totalRides: { type: Number, default: 0 },
  
  referralCode: { type: String, unique: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  referralEarnings: { type: Number, default: 0 },
  
  otp: String,
  otpExpiry: Date,
  refreshToken: String,
  fcmToken: String,
  
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Index for geospatial queries
UserSchema.index({ lastKnownLocation: '2dsphere' });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ referralCode: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate referral code
UserSchema.methods.generateReferralCode = function(): string {
  return `TR${this.firstName.substring(0, 2).toUpperCase()}${Date.now().toString().slice(-6)}`;
};

export default mongoose.model<IUser>('User', UserSchema);
