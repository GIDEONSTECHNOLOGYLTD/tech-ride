import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  referralCode: string;
  
  // Rewards
  referrerReward: number;
  referredUserReward: number;
  currency: 'NGN' | 'USDT';
  
  // Status
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  isRewardClaimed: boolean;
  claimedAt?: Date;
  
  // Conditions
  requiredRides: number; // Number of rides before reward is given
  completedRides: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true, uppercase: true },
  
  referrerReward: { type: Number, default: 1000, min: 0 }, // ₦1000 for referrer
  referredUserReward: { type: Number, default: 500, min: 0 }, // ₦500 for new user
  currency: { type: String, enum: ['NGN', 'USDT'], default: 'NGN' },
  
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'EXPIRED'], 
    default: 'PENDING' 
  },
  isRewardClaimed: { type: Boolean, default: false },
  claimedAt: Date,
  
  requiredRides: { type: Number, default: 1, min: 1 }, // Reward after 1 completed ride
  completedRides: { type: Number, default: 0, min: 0 },
}, {
  timestamps: true
});

// Indexes
ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ referredUserId: 1 });
ReferralSchema.index({ referralCode: 1 });
ReferralSchema.index({ status: 1 });

export default mongoose.model<IReferral>('Referral', ReferralSchema);
