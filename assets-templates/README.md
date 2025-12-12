# 🎨 App Icon & Splash Screen Templates

Professional SVG templates for TechRide app icons and splash screens.

---

## 📁 **FILES IN THIS FOLDER**

1. **rider-icon.svg** - Rider app icon (car + location pin, blue gradient)
2. **driver-icon.svg** - Driver app icon (steering wheel, green gradient)
3. **rider-splash.svg** - Rider app splash screen
4. **driver-splash.svg** - Driver app splash screen

---

## 🚀 **HOW TO CONVERT SVG → PNG**

### **Method 1: Online Converter (Easiest)**

**For Icons (1024×1024):**
1. Go to: https://svgtopng.com/ or https://cloudconvert.com/svg-to-png
2. Upload SVG file
3. Set width: **1024 pixels**
4. Set height: **1024 pixels**
5. Download PNG
6. Rename and place in correct assets folder

**For Splash Screens (1242×2436):**
1. Same website
2. Set width: **1242 pixels**
3. Set height: **2436 pixels**
4. Download PNG

---

### **Method 2: Using Figma (Recommended)**

1. **Open Figma** (free account: https://figma.com)
2. Create new file
3. **Import SVG:**
   - File → Import → Select SVG file
   - Or drag and drop SVG into Figma
4. **Export as PNG:**
   - Select frame/group
   - Export settings: PNG, 1x
   - Click "Export"
5. Rename and place in assets folder

---

### **Method 3: Using Command Line (Mac/Linux)**

Install ImageMagick:
```bash
brew install imagemagick
```

Convert icons:
```bash
convert -background none -resize 1024x1024 rider-icon.svg rider-icon.png
convert -background none -resize 1024x1024 driver-icon.svg driver-icon.png
```

Convert splash screens:
```bash
convert -background none -resize 1242x2436 rider-splash.svg rider-splash.png
convert -background none -resize 1242x2436 driver-splash.svg driver-splash.png
```

---

## 📱 **WHERE TO PLACE THE FILES**

### **Rider App** (`mobile-app/assets/`):
```
mobile-app/assets/
├── icon.png           ← rider-icon.png (1024×1024)
├── adaptive-icon.png  ← rider-icon.png (1024×1024, same file)
├── splash.png         ← rider-splash.png (1242×2436)
└── favicon.png        ← (optional, 32×32 version)
```

### **Driver App** (`driver-app/assets/`):
```
driver-app/assets/
├── icon.png           ← driver-icon.png (1024×1024)
├── adaptive-icon.png  ← driver-icon.png (1024×1024, same file)
├── splash.png         ← driver-splash.png (1242×2436)
└── favicon.png        ← (optional, 32×32 version)
```

---

## 🎯 **QUICK COMMANDS**

### **Convert All Icons:**
```bash
cd /Users/gideonaina/CascadeProjects/ride-hailing-platform/assets-templates

# Convert SVGs to PNGs (if you have ImageMagick)
convert -background none -resize 1024x1024 rider-icon.svg rider-icon.png
convert -background none -resize 1024x1024 driver-icon.svg driver-icon.png
convert -resize 1242x2436 rider-splash.svg rider-splash.png
convert -resize 1242x2436 driver-splash.svg driver-splash.png

# Copy to rider app
cp rider-icon.png ../mobile-app/assets/icon.png
cp rider-icon.png ../mobile-app/assets/adaptive-icon.png
cp rider-splash.png ../mobile-app/assets/splash.png

# Copy to driver app
cp driver-icon.png ../driver-app/assets/icon.png
cp driver-icon.png ../driver-app/assets/adaptive-icon.png
cp driver-splash.png ../driver-app/assets/splash.png
```

---

## 🎨 **DESIGN SPECIFICATIONS**

### **Rider App:**
- **Colors:** Blue gradient (#3B82F6 → #2563EB)
- **Icon:** Car with location pin
- **Style:** Modern, friendly, accessible
- **Tagline:** "Your Ride, Your Way"

### **Driver App:**
- **Colors:** Green gradient (#00C851 → #00A843)
- **Icon:** Steering wheel with "TR" branding
- **Style:** Professional, trustworthy
- **Tagline:** "Drive. Earn. Succeed."

---

## ✅ **AFTER REPLACING ICONS**

1. **Clear Expo cache:**
```bash
cd mobile-app
rm -rf .expo
cd ../driver-app
rm -rf .expo
```

2. **Test locally:**
```bash
npx expo start --clear
```

3. **Rebuild for production:**
```bash
# Rider app
cd mobile-app
eas build --platform all --profile production

# Driver app
cd driver-app
eas build --platform all --profile production
```

---

## 🎯 **ALTERNATIVES**

If you want even more professional icons:

1. **Hire on Fiverr ($20-50, 48 hours):**
   - Search: "mobile app icon design"
   - Provide: Colors, style reference (Uber/Bolt)
   - Get: Source files + all sizes

2. **Use Canva Pro ($12.99/month):**
   - Templates for app icons
   - Easy customization
   - Export at any size

3. **Use App Icon Generator:**
   - https://appicon.co/
   - https://makeappicon.com/
   - Upload 1024×1024 PNG, get all sizes

---

## 📋 **CHECKLIST**

- [ ] Convert SVGs to PNGs
- [ ] Place icons in mobile-app/assets/
- [ ] Place icons in driver-app/assets/
- [ ] Clear Expo cache
- [ ] Test on physical device
- [ ] Rebuild apps for production
- [ ] Submit to app stores

---

**Your apps will now have professional, brand-consistent icons! 🎨✨**
