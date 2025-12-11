# 📱 Build & Submit Apps to App Store/Play Store

## 🎯 **RIDER APP - READY TO BUILD**

### **Prerequisites:**
```bash
npm install -g eas-cli
eas login
```

### **Configure EAS Build:**
```bash
cd mobile-app
eas build:configure
```

### **Build for iOS:**
```bash
# Development build
eas build --platform ios --profile development

# Production build for App Store
eas build --platform ios --profile production
```

### **Build for Android:**
```bash
# Development build
eas build --platform android --profile development

# Production build for Play Store
eas build --platform android --profile production
```

### **Submit to App Store:**
```bash
eas submit --platform ios
```

### **Submit to Play Store:**
```bash
eas submit --platform android
```

---

## ⚠️ **DRIVER APP - NEEDS COMPLETE REBUILD**

**Current Issue:** Driver app missing native iOS/Android projects

### **Solution: Convert to Expo (Same as Rider App)**

```bash
cd driver-app

# 1. Remove broken native folders
rm -rf android ios node_modules

# 2. Update package.json - add Expo
npm install expo@~50.0.0 --save

# 3. Create proper app.json
# See DRIVER_APP_EXPO_CONVERSION.md

# 4. Install dependencies
npm install --legacy-peer-deps

# 5. Configure EAS
eas build:configure

# 6. Build
eas build --platform ios --profile production
eas build --platform android --profile production
```

---

## 📋 **Detailed Build Steps**

### **RIDER APP (Works Now):**

#### **Step 1: Test Locally**
```bash
cd mobile-app
npx expo start
# Press 'i' for iOS or 'a' for Android
```

#### **Step 2: Build for App Store (iOS)**
```bash
# Login to EAS
eas login

# Configure (first time only)
eas build:configure

# Build production
eas build --platform ios --profile production

# This creates .ipa file
# Download from https://expo.dev/accounts/YOUR_ACCOUNT/projects/techride/builds
```

#### **Step 3: Submit to App Store**
```bash
eas submit --platform ios
# Or manually upload .ipa to App Store Connect
```

#### **Step 4: Build for Play Store (Android)**
```bash
eas build --platform android --profile production
# Creates .aab file

# Submit
eas submit --platform android
```

---

## 🔧 **Current EAS Config** (`mobile-app/eas.json`)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.gideonstech.techride"
      },
      "android": {
        "package": "com.gideonstech.techride"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

---

## 📱 **App Store Requirements**

### **Before Submission:**
1. ✅ App icons (all sizes)
2. ✅ Screenshots
3. ✅ Privacy policy
4. ✅ App description
5. ✅ Test on real devices
6. ✅ Apple Developer Account ($99/year)
7. ✅ Google Play Developer Account ($25 one-time)

---

## 🎯 **Quick Commands Summary**

### **Rider App (Production Ready):**
```bash
cd mobile-app

# Test
npx expo start

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Submit iOS
eas submit --platform ios

# Submit Android
eas submit --platform android
```

### **Driver App (After Expo Conversion):**
```bash
cd driver-app

# Same commands as rider app
eas build --platform ios --profile production
eas build --platform android --profile production
```

---

## 📊 **Build Timeline:**

- **iOS Build:** ~15-20 minutes
- **Android Build:** ~10-15 minutes
- **App Store Review:** 1-3 days
- **Play Store Review:** 1-2 hours

---

## ✅ **Checklist Before Production:**

- [ ] Test all features on real device
- [ ] Test payment with Paystack
- [ ] Test ride request end-to-end
- [ ] Test Socket.io real-time tracking
- [ ] Update app icons and splash screen
- [ ] Add privacy policy URL
- [ ] Configure push notifications
- [ ] Test on iOS 14+ and Android 10+
- [ ] Create App Store screenshots
- [ ] Write app description

---

**Rider app is ready to build NOW!**  
**Driver app needs Expo conversion first.**
