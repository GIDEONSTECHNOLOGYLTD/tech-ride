import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  description: string;
  
  // Discount
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount?: number; // Max discount amount for percentage type
  
  // Validity
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  
  // Usage Limits
  maxUsageTotal: number; // Total times code can be used
  maxUsagePerUser: number; // Times each user can use it
  currentUsage: number;
  
  // Restrictions
  minRideAmount?: number;
  applicableVehicleTypes?: string[];
  applicableToNewUsersOnly: boolean;
  
  // User Specific
  specificUsers?: mongoose.Types.ObjectId[];
  
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, required: true },
  
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, min: 0 },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  
  maxUsageTotal: { type: Number, required: true, min: 1 },
  maxUsagePerUser: { type: Number, default: 1, min: 1 },
  currentUsage: { type: Number, default: 0, min: 0 },
  
  minRideAmount: { type: Number, min: 0 },
  applicableVehicleTypes: [{ type: String, enum: ['ECONOMY', 'COMFORT', 'XL', 'BIKE'] }],
  applicableToNewUsersOnly: { type: Boolean, default: false },
  
  specificUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

// Indexes
PromoCodeSchema.index({ isActive: 1, endDate: 1 });

export default mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);
