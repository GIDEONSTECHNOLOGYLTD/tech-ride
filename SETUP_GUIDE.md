# 🚀 Complete Setup Guide - Bolt Competitor

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Redis** 6+
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (Mac) or **Android Studio** (for mobile testing)

## API Keys Required

Get these before starting:

1. **Google Maps API** - https://console.cloud.google.com
2. **Twilio** (SMS) - https://www.twilio.com
3. **Stripe** (Payments) - https://stripe.com
4. **Firebase** (Push Notifications) - https://console.firebase.google.com

---

## 🔧 Backend Setup

### 1. Install PostgreSQL & Redis

```bash
# Mac (using Homebrew)
brew install postgresql@14 redis
brew services start postgresql@14
brew services start redis

# Verify installation
psql --version
redis-cli ping  # Should return "PONG"
```

### 2. Create Database

```bash
# Create database
createdb ridehailing

# Or using psql
psql postgres
CREATE DATABASE ridehailing;
\q
```

### 3. Configure Backend

```bash
cd /Users/gideonaina/CascadeProjects/ride-hailing-platform/backend

# Install dependencies (already done)
npm install

# Setup environment variables
cp .env.example .env
nano .env  # Edit with your API keys
```

**Required `.env` variables:**

```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/ridehailing"
JWT_SECRET=your-super-secret-key-change-this
GOOGLE_MAPS_API_KEY=your-key-here
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=your-twilio-number
STRIPE_SECRET_KEY=sk_test_your-key
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start Backend Server

```bash
npm run dev

# Server should start at http://localhost:5000
```

---

## 📱 Mobile App Setup

### 1. Install Dependencies

```bash
cd /Users/gideonaina/CascadeProjects/ride-hailing-platform/mobile-app
npm install
```

### 2. Configure API Endpoint

Edit `src/services/api.service.ts`:

```typescript
// For iOS Simulator
const API_BASE_URL = 'http://localhost:5000/api';

// For Android Emulator  
const API_BASE_URL = 'http://10.0.2.2:5000/api';

// For Physical Device (use your computer's IP)
const API_BASE_URL = 'http://192.168.1.XXX:5000/api';
```

### 3. Get Google Maps API Key

1. Go to https://console.cloud.google.com
2. Create project → Enable Maps SDK for iOS & Android
3. Create API key
4. Add to `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_KEY"
        }
      }
    }
  }
}
```

### 4. Start Mobile App

```bash
# Start Expo
npm start

# Then press:
# i - for iOS Simulator
# a - for Android Emulator
# Scan QR code - for Physical Device
```

---

## 🎨 Admin Dashboard Setup

```bash
cd /Users/gideonaina/CascadeProjects/ride-hailing-platform/admin-dashboard
npm install
npm run dev

# Access at http://localhost:3001
```

---

## 🧪 Testing the Platform

### Test Flow:

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Mobile App**: `cd mobile-app && npm start`
3. **Open App**: Press `i` for iOS or `a` for Android

### Test Ride Flow:

1. Register new user in mobile app
2. Skip onboarding
3. On home screen, tap "Enter your destination"
4. Select vehicle type and payment method
5. Request ride
6. Watch real-time tracking simulation

---

## 🚀 Production Deployment

### Backend (Railway/Heroku)

```bash
# Add buildpack
heroku buildpacks:set heroku/nodejs

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```

### Mobile App (Expo EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 🔑 Key Features Built

✅ **Lower Commission**: 15% vs Bolt's 20%+  
✅ **Real-time GPS Tracking**  
✅ **Multiple Vehicle Types**: Economy, Comfort, XL, Bike  
✅ **Wallet System**  
✅ **In-app Chat**  
✅ **Scheduled Rides**  
✅ **Promo Codes**  
✅ **Driver Rating System**  
✅ **SOS Emergency Button**  
✅ **Trip Sharing**  
✅ **Surge Pricing**

---

## 📞 Support

Issues? Check:
- Backend logs: `cd backend && npm run dev`
- Mobile logs: Expo DevTools
- Database: `psql ridehailing`

**Common Issues:**

1. **Database connection error**: Check PostgreSQL is running
2. **Port already in use**: Kill process on port 5000
3. **Maps not showing**: Verify Google Maps API key
4. **Socket connection failed**: Check backend server is running

---

## 🎯 Next Steps

- [ ] Add payment processing (Stripe/Paystack)
- [ ] Setup Firebase push notifications
- [ ] Add more vehicle types
- [ ] Implement referral system
- [ ] Add multi-language support
- [ ] Create driver onboarding flow
- [ ] Add admin analytics

**You're ready to compete with Bolt!** 🚗💨
