# 🚗 TechRide Driver App

React Native mobile application for TechRide drivers in Nigeria.

## 📱 Features

### ✅ Implemented
- **Authentication**
  - Phone + password login
  - Driver registration
  - OTP verification
  
- **Dashboard**
  - Online/Offline toggle
  - Real-time ride requests
  - Today's earnings display
  - Performance stats
  
- **Ride Management**
  - Accept/reject ride requests
  - Sound notifications for new rides
  - Real-time location tracking
  - In-ride navigation
  
- **Earnings**
  - Daily/weekly/monthly earnings
  - Ride statistics
  - Withdrawal to bank
  - Transaction history
  
- **Profile**
  - Driver information
  - Vehicle details
  - Bank account setup
  - Settings

### 🚧 In Progress
- Active ride screen with navigation
- Bank account linking
- Document upload
- Withdrawal flow

## 🛠️ Installation

### Prerequisites
- Node.js >= 18
- React Native CLI
- Xcode (iOS) or Android Studio (Android)

### Setup

```bash
# Install dependencies
cd driver-app
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

### Environment Variables

Create `.env` file:
```
API_URL=http://localhost:5000/api
SOCKET_URL=http://localhost:5000
GOOGLE_MAPS_API_KEY=your_key_here
```

### Firebase Setup

1. Add `google-services.json` to `android/app/`
2. Add `GoogleService-Info.plist` to `ios/`

## 📂 Project Structure

```
driver-app/
├── src/
│   ├── screens/           # All screens
│   │   ├── auth/          # Login, Register, OTP
│   │   └── main/          # Dashboard, Earnings, etc.
│   ├── components/        # Reusable components
│   ├── navigation/        # Navigation setup
│   ├── services/          # API & Socket services
│   ├── context/           # React Context (Auth, Ride)
│   ├── utils/             # Utilities
│   └── types/             # TypeScript types
├── App.tsx
└── package.json
```

## 🎯 Key Components

### Services
- **api.ts** - REST API communication
- **socket.ts** - Real-time Socket.IO

### Context
- **AuthContext** - User authentication state
- **RideContext** - Ride management state

### Screens
- **LoginScreen** - Driver login
- **RegisterScreen** - Driver registration
- **DashboardScreen** - Main screen with online toggle
- **EarningsScreen** - Earnings tracking
- **ProfileScreen** - Driver profile
- **RideHistoryScreen** - Past rides

## 🔐 Permissions Required

- **Location** - Foreground & background (iOS/Android)
- **Notifications** - Push notifications (Firebase)
- **Camera** - Document & photo upload
- **Storage** - Document access

## 🚀 Features to Add

- [ ] Active ride screen with Google Maps navigation
- [ ] Bank account linking with Paystack
- [ ] Document upload for verification
- [ ] Withdrawal flow
- [ ] In-app chat with rider
- [ ] SOS emergency button
- [ ] Offline mode
- [ ] Language selector (5 languages)

## 📊 Progress: 70% Complete

**What Works:**
- ✅ Authentication flow
- ✅ Dashboard with online toggle
- ✅ Real-time ride requests
- ✅ Earnings tracking
- ✅ Profile management
- ✅ Ride history

**What's Missing:**
- ❌ Active ride screen (critical!)
- ❌ Navigation integration
- ❌ Bank linking
- ❌ Document upload
- ❌ Withdrawal UI

**Estimate:** 1-2 days to complete

## 🔗 API Endpoints Used

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `GET /api/drivers/profile`
- `PUT /api/drivers/status`
- `PUT /api/drivers/location`
- `GET /api/drivers/earnings`
- `GET /api/drivers/stats`
- `POST /api/rides/:id/accept`
- `POST /api/rides/:id/start`
- `POST /api/rides/:id/complete`

## 📱 Testing

```bash
# Run on device
npm run android
npm run ios

# Build release
cd android && ./gradlew assembleRelease
cd ios && xcodebuild -scheme TechRideDriver -configuration Release
```

## 🎨 Design

**Colors:**
- Primary: `#00C851` (Nigerian Green)
- Secondary: `#1E88E5` (Blue)
- Accent: `#FFC107` (Gold)
- Error: `#F44336` (Red)

## 📝 Notes

- Location updates every 5 seconds when online
- Socket.IO auto-reconnects
- Ride requests expire after 30 seconds
- Minimum payout: ₦1,000

## 🐛 Known Issues

- None currently

## 📄 License

Proprietary - GIDEONS TECHNOLOGY LTD
