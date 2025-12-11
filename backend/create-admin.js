// Run this script in Render Shell to create an admin user
// Usage: node create-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: { type: String, unique: true },
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  isActive: Boolean,
  walletBalance: Number,
  referralCode: String,
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Generate random referral code
    const referralCode = Math.random().toString(36).substring(2, 12).toUpperCase();
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);

    // Check if admin already exists
    const existing = await User.findOne({ phoneNumber: '+2348012345678' });
    
    if (existing) {
      console.log('📝 User already exists, updating to ADMIN role...');
      existing.role = 'ADMIN';
      existing.isVerified = true;
      existing.isActive = true;
      await existing.save();
      console.log('✅ User updated to ADMIN successfully!');
      console.log('📱 Phone: +2348012345678');
      console.log('🔐 Password: Admin@123456');
    } else {
      console.log('👤 Creating new admin user...');
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+2348012345678',
        email: 'admin@techride.com',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
        walletBalance: 0,
        referralCode: referralCode,
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📱 Phone: +2348012345678');
      console.log('🔐 Password: Admin@123456');
      console.log('👤 User ID:', admin._id);
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
