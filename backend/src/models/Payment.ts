import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  rideId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  
  // Payment Details
  amount: number;
  currency: 'NGN' | 'USDT' | 'BTC' | 'ETH';
  method: 'WALLET' | 'CASH' | 'PAYSTACK' | 'CRYPTO';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  
  // Paystack Integration
  paystackReference?: string;
  paystackStatus?: string;
  
  // Crypto Payment
  cryptoDetails?: {
    network: 'BTC' | 'ETH' | 'BSC' | 'TRON';
    txHash?: string;
    fromAddress?: string;
    toAddress?: string;
    confirmations?: number;
  };
  
  // Breakdown
  baseFare: number;
  surgeCharge: number;
  discount: number;
  platformCommission: number;
  driverEarnings: number;
  
  // Metadata
  failureReason?: string;
  refundReason?: string;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
  
  amount: { type: Number, required: true, min: 0 },
  currency: { 
    type: String, 
    enum: ['NGN', 'USDT', 'BTC', 'ETH'], 
    default: 'NGN' 
  },
  method: { 
    type: String, 
    enum: ['WALLET', 'CASH', 'PAYSTACK', 'CRYPTO'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'], 
    default: 'PENDING' 
  },
  
  paystackReference: { type: String, unique: true, sparse: true },
  paystackStatus: String,
  
  cryptoDetails: {
    network: { type: String, enum: ['BTC', 'ETH', 'BSC', 'TRON'] },
    txHash: String,
    fromAddress: String,
    toAddress: String,
    confirmations: { type: Number, default: 0 },
  },
  
  baseFare: { type: Number, required: true, min: 0 },
  surgeCharge: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  platformCommission: { type: Number, required: true, min: 0 },
  driverEarnings: { type: Number, required: true, min: 0 },
  
  failureReason: String,
  refundReason: String,
  refundedAt: Date,
}, {
  timestamps: true
});

// Indexes
PaymentSchema.index({ rideId: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ driverId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paystackReference: 1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
