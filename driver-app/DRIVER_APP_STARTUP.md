# 🚗 TechRide Driver App - Startup Guide

## ⚠️ **IMPORTANT: This is React Native CLI, NOT Expo**

The driver app uses **React Native CLI** (bare workflow), not Expo.  
**DO NOT** run `npx expo start` - it won't work.

---

## 📱 **How to Start Driver App**

### **1. Install Dependencies**
```bash
cd driver-app
npm install --legacy-peer-deps
```

### **2. Install iOS Pods (macOS only)**
```bash
cd ios
pod install
cd ..
```

### **3. Start Metro Bundler**
```bash
npm start
```

### **4. Run on iOS Simulator (separate terminal)**
```bash
npx react-native run-ios
```

### **5. Run on Android Emulator**
```bash
npx react-native run-android
```

---

## 🔧 **Troubleshooting**

### **Error: "Unable to find expo"**
- **Cause:** Driver app is React Native CLI, not Expo
- **Solution:** Use `npx react-native run-ios` instead

### **Metro Bundler Issues**
```bash
# Clear cache
npx react-native start --reset-cache
```

### **Build Errors**
```bash
# Clean build folders
cd ios && rm -rf build && cd ..
cd android && ./gradlew clean && cd ..
```

---

## 📦 **Key Differences from Rider App**

| Feature | Rider App | Driver App |
|---------|-----------|------------|
| **Framework** | Expo (managed) | React Native CLI (bare) |
| **Start Command** | `npx expo start` | `npx react-native run-ios` |
| **QR Scan** | ✅ Yes | ❌ No |
| **Native Modules** | Limited | Full access |
| **Build** | EAS Build | Xcode/Android Studio |

---

## ✅ **Current Status**

- ✅ Dependencies installed
- ✅ Project structure complete
- ✅ All screens scaffolded
- ⚠️ Needs iOS pod install
- ⚠️ Needs testing on simulator

---

**Remember:** Driver app = React Native CLI = `react-native run-ios`
