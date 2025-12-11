# 🚀 Complete TechRide Platform Deployment Guide

## 📱 Your Platform Components

| App | Type | Users | Deployment Target |
|-----|------|-------|-------------------|
| **Backend API** | Node.js/Express | N/A | Render (Web Service) |
| **Admin Dashboard** | Next.js Web App | Admins | Render (Web Service) |
| **Rider App** | React Native (Expo) | Passengers | Expo / App Stores |
| **Driver App** | React Native | Drivers | App Stores |

---

## 🎯 Deployment Strategy

### Phase 1: Backend & Admin (Web) - **20 minutes**
Deploy to Render (cloud hosting)

### Phase 2: Mobile Apps - **2-3 hours** 
Deploy to Expo (instant) or App Stores (2-3 days review)

---

# PHASE 1: Web Apps Deployment (Backend + Admin)

## 1️⃣ Backend API - Render Deployment

### Build Command
```bash
cd backend && npm install && npm run build
```

### Start Command
```bash
cd backend && npm start
```

### What This Does
1. Navigates to `backend` folder
2. Installs dependencies from `package.json`
3. Compiles TypeScript → JavaScript (`tsc`)
4. Starts server from `dist/server.js`
5. Server runs on port **5000**

### Environment Variables Required
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techride
JWT_SECRET=your-generated-secret-key
JWT_EXPIRE=7d
PAYSTACK_SECRET_KEY=sk_live_your_key
GOOGLE_MAPS_API_KEY=your_maps_key
```

### Health Check
- Path: `/health`
- URL: `https://tech-ride.onrender.com/health`
- Returns: `{"status":"ok","timestamp":"..."}`

---

## 2️⃣ Admin Dashboard - Render Deployment

### Build Command
```bash
cd admin-dashboard && npm install && npm run build
```

### Start Command
```bash
cd admin-dashboard && npm start
```

### What This Does
1. Navigates to `admin-dashboard` folder
2. Installs dependencies
3. Builds Next.js production bundle (`.next` folder)
4. Starts Next.js server
5. Runs on port **3000** (default)

### Environment Variables Required
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://tech-ride.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://tech-ride.onrender.com
```

### Access
- URL: `https://techride-admin.onrender.com`
- Features: Dashboard, driver approval, ride management, analytics

---

# PHASE 2: Mobile Apps Deployment

## 🎯 Deployment Options

### **Option A: Expo (Recommended for Testing) - INSTANT**
✅ No app store approval needed
✅ Deploy in 5 minutes
✅ Users scan QR code or use Expo Go app
❌ Requires Expo Go app installed
❌ Not for production (use for beta testing)

### **Option B: App Stores (Production) - 2-3 DAYS**
✅ Professional deployment
✅ Users download from Play Store / App Store
✅ No dependencies (native apps)
❌ Requires developer accounts ($25 Play Store, $99/year App Store)
❌ 1-3 day review process

---

## 3️⃣ Rider App (Mobile) - Expo Deployment

### Development Commands
```bash
cd mobile-app

# Install dependencies
npm install

# Start development server
npm start
# or
expo start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

### Production Build - Expo

#### Step 1: Install Expo CLI
```bash
npm install -g expo-cli eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
```

#### Step 3: Configure Project
```bash
cd mobile-app
eas build:configure
```

#### Step 4: Build for Android
```bash
# APK for testing
eas build --platform android --profile preview

# AAB for Play Store
eas build --platform android --profile production
```

#### Step 5: Build for iOS (Mac required)
```bash
eas build --platform ios --profile production
```

#### Step 6: Deploy to Expo
```bash
# Publish update (over-the-air)
eas update --branch production
```

### Environment Setup
The app uses `.env.production`:
```env
API_URL=https://tech-ride.onrender.com/api
SOCKET_URL=https://tech-ride.onrender.com
GOOGLE_MAPS_API_KEY=your_key
```

### Access
- **Expo Go**: `exp://techride.exp.direct`
- **Direct Download**: Link from EAS build

---

## 4️⃣ Driver App - Native Build & App Stores

### Development Commands
```bash
cd driver-app

# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

### Production Build - Android (Play Store)

#### Step 1: Generate Keystore
```bash
cd driver-app/android/app

keytool -genkeypair -v -storetype PKCS12 \
  -keystore techride-driver.keystore \
  -alias techride-driver \
  -keyalg RSA -keysize 2048 -validity 10000
```

#### Step 2: Configure Build
Edit `android/gradle.properties`:
```properties
TECHRIDE_UPLOAD_STORE_FILE=techride-driver.keystore
TECHRIDE_UPLOAD_KEY_ALIAS=techride-driver
TECHRIDE_UPLOAD_STORE_PASSWORD=your_password
TECHRIDE_UPLOAD_KEY_PASSWORD=your_password
```

#### Step 3: Build APK
```bash
cd driver-app/android

# Release build
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

#### Step 4: Build AAB (for Play Store)
```bash
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Production Build - iOS (App Store)

#### Step 1: Open Xcode (Mac only)
```bash
cd driver-app/ios
open TechRideDriver.xcworkspace
```

#### Step 2: Configure Signing
- Xcode → Signing & Capabilities
- Team: Select your Apple Developer account
- Bundle ID: `com.techride.driver`

#### Step 3: Archive
- Product → Archive
- Distribute App → App Store Connect

### Environment Setup
The app uses `.env.production`:
```env
API_URL=https://tech-ride.onrender.com/api
SOCKET_URL=https://tech-ride.onrender.com
GOOGLE_MAPS_API_KEY=your_key
```

---

# 📋 Complete Start Commands Summary

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
# Runs on: http://localhost:5001
```

### Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
# Runs on: http://localhost:3001
```

### Rider App (Expo)
```bash
cd mobile-app
npm install
npm start
# Scan QR code with Expo Go
```

### Driver App
```bash
cd driver-app
npm install
npm start
# Then: npm run android (or ios)
```

---

## Production Deployment

### Backend (Render)
```bash
# Build Command
cd backend && npm install && npm run build

# Start Command
cd backend && npm start

# Health Check
curl https://tech-ride.onrender.com/health
```

### Admin Dashboard (Render)
```bash
# Build Command
cd admin-dashboard && npm install && npm run build

# Start Command  
cd admin-dashboard && npm start

# Access
https://techride-admin.onrender.com
```

### Rider App (Expo)
```bash
cd mobile-app
eas build --platform android --profile production
eas build --platform ios --profile production
eas submit --platform android
eas submit --platform ios
```

### Driver App (Native)
```bash
# Android
cd driver-app/android
./gradlew bundleRelease

# iOS (Mac)
cd driver-app/ios
xcodebuild archive -workspace TechRideDriver.xcworkspace
```

---

# 🔧 Configuration Files Reference

## Backend - `backend/.env`
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/techride
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PAYSTACK_SECRET_KEY=sk_test_your_key
GOOGLE_MAPS_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

## Admin Dashboard - `admin-dashboard/.env`
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

## Rider App - `mobile-app/.env`
```env
API_URL=http://localhost:5001/api
SOCKET_URL=http://localhost:5001
GOOGLE_MAPS_API_KEY=your_key
```

## Driver App - `driver-app/.env`
```env
API_URL=http://localhost:5001/api
SOCKET_URL=http://localhost:5001
GOOGLE_MAPS_API_KEY=your_key
```

---

# ✅ Deployment Checklist

## Pre-Deployment
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string obtained
- [ ] Paystack account created (test + live keys)
- [ ] Google Maps API key obtained
- [ ] GitHub repository pushed
- [ ] Render account created
- [ ] All environment files configured

## Backend Deployment
- [ ] Render web service created
- [ ] Environment variables set
- [ ] MongoDB URI configured
- [ ] Health check returns 200 OK
- [ ] Backend URL: `https://tech-ride.onrender.com`

## Admin Dashboard Deployment
- [ ] Render web service created
- [ ] API_URL points to backend
- [ ] Dashboard loads successfully
- [ ] Can login as admin
- [ ] Dashboard URL: `https://techride-admin.onrender.com`

## Rider App Deployment
- [ ] Production env file updated with backend URL
- [ ] Expo account created (if using Expo)
- [ ] Android build successful
- [ ] iOS build successful (if targeting iPhone)
- [ ] App tested on real device
- [ ] Play Store listing created (or Expo published)

## Driver App Deployment
- [ ] Production env file updated
- [ ] Android keystore generated
- [ ] AAB file generated for Play Store
- [ ] iOS archive created (if targeting iPhone)
- [ ] App tested on real device
- [ ] Play Store listing created

## Post-Deployment Testing
- [ ] Backend health check works
- [ ] Admin can login
- [ ] Rider app connects to backend
- [ ] Driver app connects to backend
- [ ] Ride request flow works end-to-end
- [ ] Payment integration works
- [ ] Push notifications work
- [ ] Real-time location tracking works

---

# 🚀 Quick Start (All Apps)

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

### 2. Start Admin Dashboard (Terminal 2)
```bash
cd admin-dashboard
npm run dev
```

### 3. Start Rider App (Terminal 3)
```bash
cd mobile-app
npm start
```

### 4. Start Driver App (Terminal 4)
```bash
cd driver-app
npm start
# Then run: npm run android
```

**All apps running!** 🎉

---

# 📱 App Store Deployment Timeline

## Google Play Store (Android)
1. **Setup**: Create developer account ($25 one-time)
2. **Build**: Generate AAB file (10 minutes)
3. **Upload**: Upload to Play Console (5 minutes)
4. **Review**: 1-3 days
5. **Live**: App available for download

## Apple App Store (iOS)
1. **Setup**: Apple Developer account ($99/year)
2. **Build**: Archive in Xcode (Mac required)
3. **Upload**: Via App Store Connect
4. **Review**: 1-3 days
5. **Live**: App available for download

---

# 💰 Total Deployment Costs

| Item | Cost | Frequency |
|------|------|-----------|
| Render Backend | $7 | /month |
| Render Admin | $7 | /month |
| MongoDB Atlas | $0 | Free tier |
| Google Play Store | $25 | One-time |
| Apple App Store | $99 | /year |
| **Total Monthly** | **$14** | - |
| **Initial Setup** | **$124** | One-time |

---

# 🎯 Recommended Deployment Order

1. **Week 1**: Deploy Backend + Admin to Render
2. **Week 2**: Test with Expo (rider + driver apps)
3. **Week 3**: Build native apps for stores
4. **Week 4**: Submit to Play Store & App Store
5. **Week 5**: Launch! 🚀

---

# 🔗 Your Production URLs

After deployment:
- **Backend API**: `https://tech-ride.onrender.com`
- **Admin Dashboard**: `https://techride-admin.onrender.com`
- **Rider App**: Play Store / App Store
- **Driver App**: Play Store / App Store

---

**Your complete TechRide platform is ready to compete with Uber & Bolt!** 🚗💨
