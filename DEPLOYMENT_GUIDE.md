# 🚀 TechRide Platform - Deployment Guide

**Production Ready!**  
**Last Updated:** November 19, 2024

---

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] MongoDB Atlas cluster created
- [ ] Production domain purchased
- [ ] SSL certificates obtained
- [ ] Cloud hosting selected
- [ ] Payment gateways configured
- [ ] Google Maps API keys
- [ ] Firebase project setup
- [ ] Backup strategy in place

### API Keys Required
- [ ] Paystack Secret Key
- [ ] Google Maps API Key
- [ ] Firebase Service Account
- [ ] JWT Secret (strong, random)
- [ ] MongoDB Connection String
- [ ] Crypto wallet addresses (BTC, ETH, USDT)

---

## 🎯 Deployment Strategy

### Phase 1: Backend (Day 1)
### Phase 2: Admin Dashboard (Day 1)
### Phase 3: Mobile Apps (Day 2-3)
### Phase 4: Testing & Launch (Day 4)

---

## 1️⃣ Backend Deployment

### Option A: Railway (Recommended for Quick Deploy)

#### Step 1: Prepare Backend
```bash
cd backend
npm install
npm run build
```

#### Step 2: Create railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Step 3: Environment Variables
```bash
# In Railway Dashboard, add:
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/techride
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxx

# Firebase
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n"

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyXXX

# Crypto Wallets
BTC_WALLET_ADDRESS=bc1qxxx
ETH_WALLET_ADDRESS=0xxxx
USDT_WALLET_ADDRESS=TxxxX

# AI Pricing
AI_PRICING_ENABLED=true
```

#### Step 4: Deploy
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

**Railway URL:** `https://your-app.up.railway.app`

---

### Option B: DigitalOcean (More Control)

#### Step 1: Create Droplet
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- $12/month plan

#### Step 2: SSH into Server
```bash
ssh root@your-droplet-ip
```

#### Step 3: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install certbot for SSL
apt install -y certbot python3-certbot-nginx
```

#### Step 4: Deploy Application
```bash
# Clone repo
git clone https://github.com/GIDEONSTECHNOLOGYLTD/tech-ride.git
cd tech-ride/backend

# Install dependencies
npm install

# Build
npm run build

# Create .env file
nano .env
# Paste production environment variables

# Start with PM2
pm2 start dist/server.js --name techride-api
pm2 save
pm2 startup
```

#### Step 5: Configure Nginx
```bash
nano /etc/nginx/sites-available/techride
```

```nginx
server {
    server_name api.techride.ng;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/techride /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d api.techride.ng
```

**API URL:** `https://api.techride.ng`

---

## 2️⃣ Admin Dashboard Deployment

### Option: Vercel (Recommended for Next.js)

#### Step 1: Prepare
```bash
cd admin-dashboard
npm install
```

#### Step 2: Create vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.techride.ng/api",
    "NEXT_PUBLIC_SOCKET_URL": "https://api.techride.ng"
  }
}
```

#### Step 3: Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Admin URL:** `https://admin.techride.ng`

---

## 3️⃣ Mobile Apps Deployment

### A. Driver App

#### iOS (App Store)

**Step 1: Configure**
```bash
cd driver-app/ios
pod install
```

Update `Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to connect you with nearby riders</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Location access is required for navigation and ride tracking</string>
```

**Step 2: Build**
1. Open `driver-app/ios/TechRideDriver.xcworkspace` in Xcode
2. Select Generic iOS Device
3. Product → Archive
4. Distribute to App Store Connect

**Step 3: App Store Connect**
1. Create app listing
2. Upload screenshots
3. Add description
4. Submit for review

---

#### Android (Play Store)

**Step 1: Configure**
Update `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            storeFile file('release.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Step 2: Generate Keystore**
```bash
cd android/app
keytool -genkey -v -keystore release.keystore -alias techride-driver -keyalg RSA -keysize 2048 -validity 10000
```

**Step 3: Build**
```bash
cd android
./gradlew assembleRelease
```

**Step 4: Play Console**
1. Create app in Play Console
2. Upload AAB file
3. Complete store listing
4. Submit for review

---

### B. Rider App

Follow same process as Driver App with appropriate package names and app IDs.

---

## 4️⃣ Post-Deployment

### Monitoring Setup

#### Install Monitoring Tools
```bash
# Backend monitoring with PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Install monitoring dashboard
pm2 plus
```

#### Set up Alerts
```bash
# Create alerts.json
{
  "server_down": {
    "trigger": "server_error",
    "action": "email",
    "target": "admin@techride.ng"
  },
  "high_memory": {
    "trigger": "memory > 80%",
    "action": "email"
  }
}
```

---

### Database Backups

#### MongoDB Atlas Backups
```bash
# Enable automated backups in Atlas dashboard
# Set retention period: 7 days
# Schedule: Daily at 2 AM UTC
```

#### Manual Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/mongo_$DATE"
tar -czf "/backups/mongo_$DATE.tar.gz" "/backups/mongo_$DATE"
rm -rf "/backups/mongo_$DATE"

# Keep last 7 days only
find /backups -name "mongo_*.tar.gz" -mtime +7 -delete
```

---

### Security Hardening

#### Backend Security
```bash
# Install Helmet.js (already in package.json)
# Enable rate limiting (already configured)
# Set up fail2ban
apt install -y fail2ban

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

#### MongoDB Security
- [ ] Enable authentication
- [ ] Whitelist IP addresses
- [ ] Use strong passwords
- [ ] Enable encryption at rest
- [ ] Regular security audits

---

## 5️⃣ Launch Checklist

### Week Before Launch
- [ ] All tests passed
- [ ] Performance testing completed
- [ ] Load testing done (100+ concurrent users)
- [ ] Security audit completed
- [ ] Backup systems verified
- [ ] Support team trained
- [ ] Documentation finalized

### Launch Day
- [ ] Deploy backend to production
- [ ] Deploy admin dashboard
- [ ] Submit mobile apps to stores
- [ ] Enable monitoring
- [ ] Set up alerts
- [ ] Announce launch
- [ ] Monitor logs closely

### Week After Launch
- [ ] Monitor user feedback
- [ ] Fix critical bugs immediately
- [ ] Collect analytics data
- [ ] Optimize performance
- [ ] Plan next features

---

## 📊 Cost Estimate

### Monthly Operating Costs

| Service | Plan | Cost |
|---------|------|------|
| **MongoDB Atlas** | M10 Dedicated | $57/mo |
| **Railway/DO** | 2GB Droplet | $12-20/mo |
| **Vercel** | Pro | $20/mo |
| **Google Maps API** | Pay-as-go | ~$50/mo |
| **Firebase** | Blaze | ~$25/mo |
| **Domain + SSL** | Yearly | ~$2/mo |
| **Paystack** | Transaction fees | 1.5% + ₦100 |
| **Total** | | **~$170/mo** |

---

## 🎉 Go Live!

### Launch Sequence
```bash
# 1. Deploy backend
cd backend && railway up

# 2. Deploy admin
cd admin-dashboard && vercel --prod

# 3. Submit apps
# iOS: Submit to App Store Connect
# Android: Upload to Play Console

# 4. Monitor
pm2 monit

# 5. Celebrate! 🎊
```

---

## 🆘 Emergency Contacts

**Technical Issues:**
- Backend: Check Railway/DO logs
- MongoDB: Check Atlas metrics
- Apps: Check Firebase Crashlytics

**Rollback Procedure:**
```bash
# Backend rollback
railway rollback

# Or with PM2
pm2 restart techride-api --update-env
```

---

## 📱 App Store Links (After Approval)

**Driver App:**
- iOS: `https://apps.apple.com/app/techride-driver/idXXXXXXXX`
- Android: `https://play.google.com/store/apps/details?id=ng.techride.driver`

**Rider App:**
- iOS: `https://apps.apple.com/app/techride/idXXXXXXXX`
- Android: `https://play.google.com/store/apps/details?id=ng.techride.rider`

---

**Ready to launch TechRide! 🚗💨**

Need help? Email: support@techride.ng
