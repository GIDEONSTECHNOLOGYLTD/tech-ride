# 🚗 Fix Driver App - Exact Commands

## ⚠️ **Problem:**
Driver app missing iOS/Android projects - can't run with `react-native run-ios`

## ✅ **Solution: Convert to Expo (5 minutes)**

Run these commands **EXACTLY**:

```bash
cd /Users/gideonaina/CascadeProjects/ride-hailing-platform/driver-app

# 1. Remove broken folders
rm -rf ios android

# 2. Install Expo
npm install expo@~50.0.0 --legacy-peer-deps

# 3. Install Expo packages
npm install expo-status-bar react-native-safe-area-context --legacy-peer-deps

# 4. Start the app
npx expo start
```

**That's it!** Press `i` for iOS or scan QR with Expo Go.

---

## 📋 **What Changed:**
- ❌ React Native CLI (broken)
- ✅ Expo (works, same as rider app)

---

## 🎯 **After Conversion:**

**Run driver app:**
```bash
cd driver-app
npx expo start
```

**Build for production:**
```bash
eas build --platform ios --profile production
```

**Same as rider app - easy!**
