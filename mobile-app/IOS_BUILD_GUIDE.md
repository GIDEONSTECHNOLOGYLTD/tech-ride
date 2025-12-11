# TechRide iOS App Build Guide

## ✅ Prerequisites (Already Completed)
- ✅ Expo CLI installed globally
- ✅ EAS CLI installed globally  
- ✅ Logged in as: `gtechldt`
- ✅ Dependencies installed
- ✅ app.json configured with iOS bundle ID
- ✅ eas.json configured

---

## 🚀 Build iOS App for Simulator (Testing)

### Step 1: Create EAS Project (One-Time Setup)
```bash
cd /Users/gideonaina/CascadeProjects/ride-hailing-platform/mobile-app
eas build:configure
```
When prompted:
- **Create EAS project?** → Press `Y`
- Project will be created automatically

---

### Step 2: Build for iOS Simulator
```bash
eas build --platform ios --profile development
```

**Build Details:**
- Platform: iOS
- Profile: development (includes expo-dev-client)
- Output: Simulator-compatible .tar.gz
- Duration: ~10-15 minutes

---

### Step 3: Install on Simulator
After build completes, download the artifact:
```bash
# EAS will provide download URL
# Or use:
eas build:list
```

Extract and install:
```bash
tar -xvzf downloaded-build.tar.gz
cd Build
xcrun simctl install booted TechRide.app
```

---

## 📱 Build for Physical Device (TestFlight/Ad-Hoc)

### Option A: Build for TestFlight (Recommended)
```bash
eas build --platform ios --profile production
```

Requirements:
- Apple Developer Account ($99/year)
- App Store Connect access
- Valid provisioning profile

After build:
```bash
eas submit --platform ios
```

---

### Option B: Build Ad-Hoc (No TestFlight)
```bash
eas build --platform ios --profile preview
```

Install via Xcode or direct device installation.

---

## 🔧 Quick Commands

### Check build status:
```bash
eas build:list
```

### View build logs:
```bash
eas build:view [build-id]
```

### Run on connected iOS device:
```bash
expo run:ios --device
```

### Run in simulator:
```bash
npx expo run:ios
```

---

## 📝 Current Configuration

**Bundle ID:** `com.gideonstech.techride`  
**App Name:** TechRide  
**Version:** 1.0.0  
**Build Number:** 1.0.0

**Location Permissions:** ✅ Configured  
**Background Modes:** ✅ Location tracking enabled  
**Maps:** ✅ React Native Maps integrated

---

## ⚠️ Important Notes

1. **First build will take longer** (~15-20 min) as it sets up project
2. **Simulator builds** are free and don't require Apple Developer account
3. **Production builds** require Apple Developer Program membership
4. **Dev client installed** - supports hot reload and debugging

---

## 🐛 Troubleshooting

### Build fails?
```bash
# Clear EAS cache
eas build:configure --clear-cache

# Check credentials
eas credentials
```

### Wrong bundle ID?
Edit `app.json` → `expo.ios.bundleIdentifier`

### Need to change version?
Edit `app.json` → `expo.version` and `expo.ios.buildNumber`

---

## 🎯 Next Steps After Build

1. **Download** the build from EAS dashboard
2. **Install** on simulator or device
3. **Test** login with backend: `https://tech-ride.onrender.com`
4. **Verify** location services and map functionality
5. **Test** real-time driver tracking

---

**Backend API:** https://tech-ride.onrender.com/api  
**Admin Dashboard:** https://techride-admin.onrender.com
