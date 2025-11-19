import mongoose, { Schema, Document } from 'mongoose';

export interface IRide extends Document {
  riderId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  
  // Locations
  pickupLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  dropoffLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  
  // Ride Details
  vehicleType: 'ECONOMY' | 'COMFORT' | 'XL' | 'BIKE';
  status: 'PENDING' | 'ACCEPTED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  
  // Pricing
  estimatedFare: number;
  finalFare?: number;
  distance: number; // in kilometers
  duration: number; // in minutes
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  surgeMultiplier: number;
  discount: number;
  promoCode?: string;
  
  // Payment
  paymentMethod: 'WALLET' | 'CASH' | 'PAYSTACK' | 'CRYPTO';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  currency: 'NGN' | 'USDT' | 'BTC' | 'ETH';
  
  // Commission
  platformCommission: number;
  driverEarnings?: number;
  
  // Timestamps
  requestedAt: Date;
  acceptedAt?: Date;
  arrivedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  
  // Cancellation
  cancelledBy?: 'RIDER' | 'DRIVER' | 'SYSTEM';
  cancellationReason?: string;
  cancellationFee?: number;
  
  // Rating
  riderRating?: number;
  driverRating?: number;
  riderReview?: string;
  driverReview?: string;
  
  // Scheduled Ride
  isScheduled: boolean;
  scheduledFor?: Date;
  
  // AI Pricing
  aiPricingFactors?: {
    demandScore: number;
    supplyScore: number;
    weatherFactor: number;
    timeFactor: number;
    eventFactor: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const RideSchema = new Schema<IRide>({
  riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
  
  pickupLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  dropoffLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  
  vehicleType: { 
    type: String, 
    enum: ['ECONOMY', 'COMFORT', 'XL', 'BIKE'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  
  estimatedFare: { type: Number, required: true, min: 0 },
  finalFare: { type: Number, min: 0 },
  distance: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 0 },
  baseFare: { type: Number, required: true, min: 0 },
  perKmRate: { type: Number, required: true, min: 0 },
  perMinuteRate: { type: Number, required: true, min: 0 },
  surgeMultiplier: { type: Number, default: 1, min: 1, max: 3 },
  discount: { type: Number, default: 0, min: 0 },
  promoCode: String,
  
  paymentMethod: { 
    type: String, 
    enum: ['WALLET', 'CASH', 'PAYSTACK', 'CRYPTO'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], 
    default: 'PENDING' 
  },
  currency: { 
    type: String, 
    enum: ['NGN', 'USDT', 'BTC', 'ETH'], 
    default: 'NGN' 
  },
  
  platformCommission: { type: Number, default: 0.15, min: 0, max: 1 },
  driverEarnings: { type: Number, min: 0 },
  
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  arrivedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  
  cancelledBy: { type: String, enum: ['RIDER', 'DRIVER', 'SYSTEM'] },
  cancellationReason: String,
  cancellationFee: { type: Number, default: 0, min: 0 },
  
  riderRating: { type: Number, min: 1, max: 5 },
  driverRating: { type: Number, min: 1, max: 5 },
  riderReview: { type: String, maxlength: 500 },
  driverReview: { type: String, maxlength: 500 },
  
  isScheduled: { type: Boolean, default: false },
  scheduledFor: Date,
  
  aiPricingFactors: {
    demandScore: { type: Number, min: 0, max: 1 },
    supplyScore: { type: Number, min: 0, max: 1 },
    weatherFactor: { type: Number, min: 0.8, max: 1.5 },
    timeFactor: { type: Number, min: 0.9, max: 1.3 },
    eventFactor: { type: Number, min: 1, max: 2 },
  },
}, {
  timestamps: true
});

// Indexes
RideSchema.index({ riderId: 1, createdAt: -1 });
RideSchema.index({ driverId: 1, createdAt: -1 });
RideSchema.index({ status: 1, createdAt: -1 });
RideSchema.index({ pickupLocation: '2dsphere' });
RideSchema.index({ scheduledFor: 1 });
RideSchema.index({ paymentStatus: 1 });

export default mongoose.model<IRide>('Ride', RideSchema);
