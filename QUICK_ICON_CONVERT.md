# 🚀 QUICK ICON CONVERSION GUIDE

**5-Minute Setup for Professional App Icons**

---

## 📱 **What You Need to Do**

Your SVG icon templates are ready in: `assets-templates/`

Just convert them to PNG and place in the apps!

---

## ⚡ **FASTEST METHOD (Online - No Software)**

### **1. Go to SVG to PNG Converter:**
**Website:** https://svgtopng.com/ (or https://cloudconvert.com/svg-to-png)

### **2. Convert Icons (1024×1024):**

**Rider App Icon:**
1. Upload: `assets-templates/rider-icon.svg`
2. Set size: **1024 × 1024**
3. Download
4. Place in: `mobile-app/assets/icon.png`
5. Copy same file to: `mobile-app/assets/adaptive-icon.png`

**Driver App Icon:**
1. Upload: `assets-templates/driver-icon.svg`
2. Set size: **1024 × 1024**
3. Download
4. Place in: `driver-app/assets/icon.png`
5. Copy same file to: `driver-app/assets/adaptive-icon.png`

### **3. Convert Splash Screens (1242×2436):**

**Rider App Splash:**
1. Upload: `assets-templates/rider-splash.svg`
2. Set size: **1242 × 2436**
3. Download
4. Place in: `mobile-app/assets/splash.png`

**Driver App Splash:**
1. Upload: `assets-templates/driver-splash.svg`
2. Set size: **1242 × 2436**
3. Download
4. Place in: `driver-app/assets/splash.png`

---

## ✅ **After Conversion**

```bash
# Clear Expo cache
cd mobile-app && rm -rf .expo
cd ../driver-app && rm -rf .expo

# Rebuild apps
cd mobile-app && eas build --platform all --profile production
cd ../driver-app && eas build --platform all --profile production
```

---

## 🎨 **Your New Icons:**

**Rider App (Blue):**
- Modern car with location pin
- Blue gradient background
- Professional, friendly

**Driver App (Green):**
- Steering wheel with "TR" logo
- Green gradient background
- Professional, distinctive

---

**Done! Your apps will now have professional icons instead of red placeholders! 🎉**
