import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Vehicle Information
  vehicleType: 'ECONOMY' | 'COMFORT' | 'XL' | 'BIKE';
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  licensePlate: string;
  
  // Documents
  documents: {
    licenseNumber: string;
    licenseExpiry: Date;
    licensePhoto?: string;
    vehicleRegistration?: string;
    insurance?: string;
    profilePhoto?: string;
  };
  
  // Status
  isOnline: boolean;
  isAvailable: boolean;
  isApproved: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  
  // Current Location
  currentLocation: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  heading?: number; // Direction in degrees
  
  // Ratings & Performance
  rating: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  acceptanceRate: number; // Percentage
  
  // Earnings
  totalEarnings: number;
  pendingEarnings: number;
  availableBalance: number;
  
  // Bank Details for Payouts
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  
  // Current Ride
  currentRideId?: mongoose.Types.ObjectId;
  
  // Metadata
  lastOnline: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  vehicleType: { 
    type: String, 
    enum: ['ECONOMY', 'COMFORT', 'XL', 'BIKE'], 
    required: true 
  },
  vehicleMake: { type: String, required: true, trim: true },
  vehicleModel: { type: String, required: true, trim: true },
  vehicleYear: { type: Number, required: true, min: 2000 },
  vehicleColor: { type: String, required: true, trim: true },
  licensePlate: { type: String, required: true, unique: true, uppercase: true, trim: true },
  
  documents: {
    licenseNumber: { type: String, required: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    licensePhoto: String,
    vehicleRegistration: String,
    insurance: String,
    profilePhoto: String,
  },
  
  isOnline: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  rejectionReason: String,
  
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true, default: [0, 0] }
  },
  heading: { type: Number, min: 0, max: 360 },
  
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  totalRides: { type: Number, default: 0, min: 0 },
  completedRides: { type: Number, default: 0, min: 0 },
  cancelledRides: { type: Number, default: 0, min: 0 },
  acceptanceRate: { type: Number, default: 100, min: 0, max: 100 },
  
  totalEarnings: { type: Number, default: 0, min: 0 },
  pendingEarnings: { type: Number, default: 0, min: 0 },
  availableBalance: { type: Number, default: 0, min: 0 },
  
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
  },
  
  currentRideId: { type: Schema.Types.ObjectId, ref: 'Ride' },
  
  lastOnline: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Indexes
DriverSchema.index({ currentLocation: '2dsphere' });
DriverSchema.index({ userId: 1 });
DriverSchema.index({ isOnline: 1, isAvailable: 1, isApproved: 1 });
DriverSchema.index({ licensePlate: 1 });
DriverSchema.index({ verificationStatus: 1 });

export default mongoose.model<IDriver>('Driver', DriverSchema);
