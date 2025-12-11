# 🚗 TechRide Platform - Complete App Separation Guide

**Last Updated:** December 11, 2025

---

## 📱 **THREE SEPARATE APPLICATIONS**

TechRide has **3 completely separate applications** for different user roles:

| App | User Type | Technology | Purpose |
|-----|-----------|------------|---------|
| **mobile-app/** | **RIDERS** (Passengers) | Expo (React Native) | Request rides, track drivers, payments |
| **driver-app/** | **DRIVERS** | React Native CLI | Accept rides, navigate, earnings |
| **admin-dashboard/** | **ADMINS** | Next.js (Web) | Manage platform, approve drivers, analytics |

---

## 1️⃣ **RIDER APP** (`/mobile-app`)

### **Technology Stack:**
- **Expo SDK 50** (Managed workflow)
- React Native with TypeScript
- Expo Go compatible

### **User Role:** RIDER (Passengers only)
- ✅ Riders register through this app
- ✅ Admins can login (for convenience)
- ❌ Drivers CANNOT use this app (blocked)

### **Registration:**
```typescript
// mobile-app/src/screens/RegisterScreen.tsx
await authAPI.register({
  ...formData,
  role: 'RIDER', // Always RIDER
});
```

### **Features:**
- ✅ Rider registration and login
- ✅ Request rides with location
- ✅ Track driver in real-time
- ✅ Wallet management and top-up
- ✅ Ride history
- ✅ Payment methods (Card, Wallet, Cash, Crypto)
- ✅ Profile management
- ✅ Logout functionality

### **Running the App:**
```bash
cd mobile-app
npm install
npx expo start
# Scan QR with Expo Go or press 'i' for iOS simulator
```

### **Build for Production:**
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

---

## 2️⃣ **DRIVER APP** (`/driver-app`)

### **Technology Stack:**
- **React Native CLI 0.73.0** (Bare workflow)
- React Native with TypeScript
- Native modules for maps and location

### **User Role:** DRIVER (Drivers only)
- ✅ Drivers register through this app
- ✅ Driver-specific features (accept rides, earnings)
- ❌ Riders and Admins should NOT use this app

### **Registration:**
```typescript
// driver-app/src/screens/auth/RegisterScreen.tsx
await register({
  ...formData,
  role: 'DRIVER', // Always DRIVER
});
```

### **Features:**
- ✅ Driver registration and login
- ✅ Accept/reject ride requests
- ✅ Real-time navigation to pickup/dropoff
- ✅ Earnings tracking (daily, weekly, monthly)
- ✅ Ride history
- ✅ Profile management with vehicle details
- ✅ Document upload (license, insurance, vehicle)
- ✅ Online/offline toggle
- ✅ Push notifications for new rides

### **Running the App:**
```bash
cd driver-app
npm install
# iOS
npx react-native run-ios
# Android
npx react-native run-android
```

### **Key Difference from Rider App:**
- Uses React Native CLI (not Expo)
- Has native dependencies
- Requires Xcode/Android Studio
- More complex build process
- Driver-specific UI (green theme)

---

## 3️⃣ **ADMIN DASHBOARD** (`/admin-dashboard`)

### **Technology Stack:**
- **Next.js 14** (App Router)
- React with TypeScript
- Tailwind CSS

### **User Role:** ADMIN (Platform administrators)
- ✅ Admins manage the entire platform
- ✅ Web-based interface
- ❌ Only accessible via web browser

### **Admin Creation:**
Admins are NOT created through signup. They are created:
1. Directly in database
2. By existing admin via backend API
3. Initial admin created during backend setup

### **Features:**
- ✅ Dashboard with platform statistics
- ✅ Manage drivers (approve/reject/view)
- ✅ Manage riders (view/block/unblock)
- ✅ Manage rides (view all, filter by status)
- ✅ Create promo codes
- ✅ View payment transactions and revenue
- ✅ Platform settings
- ✅ Commission management

### **Running the Dashboard:**
```bash
cd admin-dashboard
npm install
npm run dev
# Open http://localhost:3000
```

### **Production Deployment:**
- Deployed at: `https://techride-admin.onrender.com`
- Build: `npm run build`
- Start: `npm start`

---

## 🔐 **Authentication & Role Separation**

### **Backend API Endpoints:**
```
POST /api/auth/register
POST /api/auth/login
```

### **User Registration by Role:**

| Role | Registration Method | App |
|------|-------------------|-----|
| **RIDER** | Mobile app signup | `mobile-app/` |
| **DRIVER** | Driver app signup | `driver-app/` |
| **ADMIN** | Backend/Database creation | N/A |

### **Login Restrictions:**

**Rider App (`mobile-app`):**
```typescript
// Allows: RIDER, ADMIN
// Blocks: DRIVER
if (user.role === 'DRIVER') {
  Alert.alert('Driver Account Detected', 
    'Use TechRide Driver app');
  return;
}
```

**Driver App (`driver-app`):**
```typescript
// Allows: DRIVER only
// Should block: RIDER, ADMIN (implement if needed)
```

**Admin Dashboard:**
```typescript
// Allows: ADMIN only
// Blocks: RIDER, DRIVER
```

---

## 📂 **Project Structure**

```
ride-hailing-platform/
│
├── mobile-app/              # RIDER APP (Expo)
│   ├── src/
│   │   ├── screens/         # 11 screens (Login, Register, Home, etc.)
│   │   ├── services/        # API, Socket
│   │   └── ...
│   ├── app.json             # Expo config
│   ├── App.tsx              # Entry point
│   └── package.json         # Expo dependencies
│
├── driver-app/              # DRIVER APP (React Native CLI)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/        # Login, Register, OTP
│   │   │   └── main/        # Dashboard, ActiveRide, Earnings, etc.
│   │   ├── services/        # API, Socket, Maps
│   │   ├── context/         # Auth, Ride contexts
│   │   └── navigation/      # Stack navigators
│   ├── ios/                 # iOS native code
│   ├── android/             # Android native code
│   ├── App.tsx              # Entry point
│   └── package.json         # React Native CLI dependencies
│
├── admin-dashboard/         # ADMIN DASHBOARD (Next.js)
│   ├── app/
│   │   ├── page.tsx         # Main dashboard
│   │   ├── login/           # Admin login
│   │   ├── drivers/         # Driver management
│   │   ├── riders/          # Rider management (users)
│   │   ├── rides/           # Ride management
│   │   ├── promos/          # Promo code management
│   │   ├── payments/        # Payment tracking
│   │   └── settings/        # Platform settings
│   ├── src/
│   │   ├── components/      # Sidebar, etc.
│   │   └── lib/             # API client
│   └── package.json         # Next.js dependencies
│
└── backend/                 # NODE.JS API SERVER
    ├── src/
    │   ├── controllers/     # Auth, Driver, Ride, Payment, Admin
    │   ├── models/          # User, Driver, Ride, Payment schemas
    │   ├── routes/          # API routes
    │   ├── middleware/      # Auth, role-based access
    │   └── socket/          # Socket.io handlers
    └── package.json
```

---

## 🎯 **Key Differences Between Apps**

### **Rider App vs Driver App:**

| Feature | Rider App | Driver App |
|---------|-----------|------------|
| **Build Tool** | Expo | React Native CLI |
| **Development** | `expo start` | `react-native run-ios` |
| **QR Scan** | ✅ Expo Go | ❌ No |
| **Theme Color** | Purple (#4F46E5) | Green (#00C851) |
| **Main Action** | Request rides | Accept rides |
| **Map View** | See nearby drivers | Navigate to destination |
| **Registration** | role: 'RIDER' | role: 'DRIVER' |
| **Documents** | ❌ No | ✅ Yes (license, vehicle) |
| **Earnings** | ❌ No | ✅ Yes |

---

## ✅ **Current Status**

### **Rider App:**
- ✅ 100% Complete with real API
- ✅ All screens functional
- ✅ No mocks
- ✅ Production ready
- ✅ Keyboard issues fixed
- ✅ Role validation working
- ✅ Logout working

### **Driver App:**
- ✅ Full structure in place
- ✅ Registration with DRIVER role
- ✅ Login screen complete
- ✅ Main screens scaffolded
- ⚠️ May need real API integration (check contexts)

### **Admin Dashboard:**
- ✅ 100% Complete
- ✅ All management pages
- ✅ Real API integration
- ✅ Production deployed

---

## 🚀 **How to Use Each App**

### **For Riders:**
1. Download TechRide mobile app
2. Sign up with phone number
3. Role: RIDER (automatic)
4. Request rides, pay, track

### **For Drivers:**
1. Download TechRide Driver app
2. Sign up with phone number + vehicle details
3. Role: DRIVER (automatic)
4. Wait for admin approval
5. Go online, accept rides, earn money

### **For Admins:**
1. Access admin dashboard via web
2. Login with admin credentials
3. Manage drivers, riders, rides
4. View analytics, create promos

---

## 📝 **Important Notes**

1. **Separate Registrations:**
   - Riders sign up in rider app
   - Drivers sign up in driver app
   - They are DIFFERENT accounts with DIFFERENT roles

2. **No Cross-Login:**
   - A driver account CANNOT login to rider app (blocked)
   - A rider account CANNOT login to driver app (should be blocked)
   - Admins can use rider app for testing convenience

3. **Database:**
   - All users stored in same `users` collection
   - Role field determines access: 'RIDER', 'DRIVER', 'ADMIN'
   - Drivers have additional `drivers` collection for vehicle data

4. **Backend is Shared:**
   - All 3 apps connect to same backend API
   - Same authentication endpoints
   - Role-based access control in middleware

---

## 🔧 **Quick Commands**

```bash
# Rider App (Expo)
cd mobile-app && npx expo start

# Driver App (React Native CLI)
cd driver-app && npx react-native run-ios

# Admin Dashboard (Next.js)
cd admin-dashboard && npm run dev

# Backend API
cd backend && npm run dev
```

---

## 📞 **Contact & Support**

- **Backend API:** `https://tech-ride.onrender.com/api`
- **Admin Dashboard:** `https://techride-admin.onrender.com`
- **Socket Server:** `https://tech-ride.onrender.com`

---

**Remember:** Each app serves a specific purpose and user type. Keep them separate!
