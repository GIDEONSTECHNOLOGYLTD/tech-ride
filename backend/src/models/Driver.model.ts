import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleType: 'ECONOMY' | 'COMFORT' | 'XL' | 'BIKE';
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  vehicleColor: string;
  licenseNumber: string;
  licenseExpiry: Date;
  insuranceNumber: string;
  insuranceExpiry: Date;
  isApproved: boolean;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation: {
    type: { type: String; enum: ['Point']; default: 'Point' };
    coordinates: [number, number]; // [longitude, latitude]
  };
  rating: number;
  totalEarnings: number;
  totalRides: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  documents: {
    license: string;
    insurance: string;
    vehicleRegistration: string;
    photo: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  vehicleType: { type: String, enum: ['ECONOMY', 'COMFORT', 'XL', 'BIKE'], required: true },
  vehicleMake: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleYear: { type: Number, required: true },
  vehiclePlate: { type: String, required: true, unique: true },
  vehicleColor: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  licenseExpiry: { type: Date, required: true },
  insuranceNumber: { type: String, required: true },
  insuranceExpiry: { type: Date, required: true },
  isApproved: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  rating: { type: Number, default: 5.0 },
  totalEarnings: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  bankName: String,
  accountNumber: String,
  accountName: String,
  documents: {
    license: String,
    insurance: String,
    vehicleRegistration: String,
    photo: String,
  },
}, { timestamps: true });

DriverSchema.index({ currentLocation: '2dsphere' });
DriverSchema.index({ isAvailable: 1, isOnline: 1 });

export default mongoose.model<IDriver>('Driver', DriverSchema);
