/**
 * Database indexing script
 * Run this to add performance indexes to MongoDB collections
 * Usage: npx ts-node src/scripts/add-indexes.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ride from '../models/Ride';
import Driver from '../models/Driver';
import Payment from '../models/Payment';
import User from '../models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/techride';

async function addIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Adding performance indexes...\n');

    // Ride indexes
    console.log('Adding Ride indexes...');
    await Ride.collection.createIndex({ createdAt: -1 });
    await Ride.collection.createIndex({ status: 1 });
    await Ride.collection.createIndex({ riderId: 1, createdAt: -1 });
    await Ride.collection.createIndex({ driverId: 1, createdAt: -1 });
    await Ride.collection.createIndex({ status: 1, createdAt: -1 });
    console.log('✅ Ride indexes created');

    // Driver indexes (compound index for nearby queries)
    console.log('Adding Driver indexes...');
    await Driver.collection.createIndex({ isOnline: 1, isAvailable: 1, isApproved: 1 });
    await Driver.collection.createIndex({ currentLocation: '2dsphere' }); // Geospatial
    await Driver.collection.createIndex({ userId: 1 });
    console.log('✅ Driver indexes created');

    // Payment indexes
    console.log('Adding Payment indexes...');
    await Payment.collection.createIndex({ paystackReference: 1 }, { unique: true, sparse: true });
    await Payment.collection.createIndex({ rideId: 1 });
    await Payment.collection.createIndex({ userId: 1, createdAt: -1 });
    await Payment.collection.createIndex({ status: 1 });
    console.log('✅ Payment indexes created');

    // User indexes
    console.log('Adding User indexes...');
    await User.collection.createIndex({ phoneNumber: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ referralCode: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    console.log('✅ User indexes created');

    console.log('\n✅ All indexes added successfully!\n');

    // List all indexes
    console.log('📋 Current indexes:\n');
    const collections = ['rides', 'drivers', 'payments', 'users'];
    for (const collName of collections) {
      const indexes = await mongoose.connection.db.collection(collName).indexes();
      console.log(`${collName}:`);
      indexes.forEach((idx: any) => {
        console.log(`  - ${JSON.stringify(idx.key)}`);
      });
      console.log('');
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    process.exit(1);
  }
}

addIndexes();
