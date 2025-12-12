# 🚀 COMPLETE DEPLOYMENT GUIDE - TechRide Platform

**Status:** Production-Ready with All Critical Fixes  
**Date:** December 12, 2024

---

## ✅ **WHAT'S BEEN FIXED**

### **All 5 Critical Issues Resolved:**
1. ✅ Wallet payment timing (charges at ride request, not completion)
2. ✅ Driver earnings flow (instant to availableBalance)
3. ✅ Driver payouts via Paystack (fully functional)
4. ✅ Wallet top-up endpoint (Paystack + Crypto)
5. ✅ Google Maps API configuration (environment variables)

### **Additional Improvements:**
6. ✅ Nigerian bank code mapping (27 banks supported)
7. ✅ Bank account verification via Paystack
8. ✅ Bank selection API endpoints
9. ✅ Document upload workflow fixed
10. ✅ Proper error handling throughout

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **1. Get API Keys (30 minutes)**

#### **A. Google Maps API Key** (REQUIRED)
```
1. Go to: https://console.cloud.google.com/
2. Create new project: "TechRide Production"
3. Enable these APIs:
   ✓ Maps SDK for Android
   ✓ Maps SDK for iOS
   ✓ Directions API
   ✓ Distance Matrix API
   ✓ Places API
   ✓ Geocoding API
4. Create credentials → API Key
5. Restrict API key:
   - Application restrictions: Android/iOS apps
   - Android: com.gideonstech.techridedriver, com.gideonstech.techride
   - iOS: com.gideonstech.techridedriver, com.gideonstech.techride
6. Copy API key
```

#### **B. Paystack Keys** (If not already have)
```
1. Go to: https://dashboard.paystack.com/
2. Settings → API Keys & Webhooks
3. Copy:
   - Secret Key (sk_live_xxx)
   - Public Key (pk_live_xxx)
4. Set webhook URL: https://tech-ride.onrender.com/api/payments/webhook
```

---

### **2. Configure Environment Variables**

#### **Backend (.env)**
```bash
# MongoDB
MONGODB_URI=mongodb+srv://your_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=sk_live_your_actual_key
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_key

# Crypto Wallets (for accepting crypto payments)
CRYPTO_WALLET_BTC=your_btc_address
CRYPTO_WALLET_ETH=your_eth_address
CRYPTO_WALLET_USDT=your_usdt_trc20_address

# ETH RPC (for crypto verification)
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Frontend URL (for CORS)
FRONTEND_URL=https://techride-admin.onrender.com

# Server
PORT=5000
NODE_ENV=production
```

#### **Driver App (.env)**
```bash
API_URL=https://tech-ride.onrender.com/api
SOCKET_URL=https://tech-ride.onrender.com
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### **Rider App (.env)**
```bash
API_URL=https://tech-ride.onrender.com/api
SOCKET_URL=https://tech-ride.onrender.com
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_key
```

---

### **3. Backend Deployment (Render)**

#### **A. Update Environment Variables in Render Dashboard**
```
1. Go to: https://dashboard.render.com/
2. Select: tech-ride (backend service)
3. Environment → Add all variables from Backend .env above
4. Save Changes
```

#### **B. Deploy Backend**
```bash
cd /Users/gideonaina/CascadeProjects/ride-hailing-platform

# Commit all changes
git add .
git commit -m "fix: Complete payment workflow, driver earnings, and maps integration"
git push origin main

# Render will auto-deploy (takes 3-5 minutes)
```

#### **C. Verify Backend**
```bash
# Test health endpoint
curl https://tech-ride.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-12-12T14:00:00.000Z"}

# Test bank list endpoint (requires auth token)
curl https://tech-ride.onrender.com/api/banks \
  -H "Authorization: Bearer YOUR_TEST_TOKEN"
```

---

### **4. Mobile Apps Deployment**

#### **A. Update App Configuration**

**Driver App:**
```bash
cd driver-app

# Update .env with your Google Maps API key
nano .env
# Replace: GOOGLE_MAPS_API_KEY=your_actual_key_here

# Update app.json with correct values
nano app.json
# Verify:
# - version: "1.0.0"
# - extra.apiUrl: "https://tech-ride.onrender.com/api"
# - extra.socketUrl: "https://tech-ride.onrender.com"
```

**Rider App:**
```bash
cd mobile-app

# Update .env
nano .env
# Replace: GOOGLE_MAPS_API_KEY=your_actual_key_here

# Update app.json
nano app.json
# Verify same as driver app
```

#### **B. Build Production Apps**
```bash
# Install/update EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build Driver App
cd driver-app
eas build --platform all --profile production

# Build Rider App  
cd ../mobile-app
eas build --platform all --profile production

# Builds take 20-40 minutes
# You'll receive email when ready
```

---

### **5. Database Migration (if you have existing data)**

If you already have drivers in production with old document/bank structure:

```javascript
// Run in MongoDB Atlas or via mongo shell

// 1. Update Driver documents for new structure
db.drivers.find({}).forEach(function(driver) {
  // Add paystackRecipientCode if missing
  if (!driver.paystackRecipientCode) {
    db.drivers.updateOne(
      { _id: driver._id },
      { $set: { paystackRecipientCode: null } }
    );
  }
  
  // Update bank details structure
  if (driver.bankDetails && !driver.bankDetails.bankCode) {
    db.drivers.updateOne(
      { _id: driver._id },
      { $set: { 'bankDetails.bankCode': null } }
    );
  }
  
  // Update document structure if using old format
  if (driver.documents) {
    const docs = driver.documents;
    if (typeof docs.licensePhoto === 'string') {
      db.drivers.updateOne(
        { _id: driver._id },
        {
          $set: {
            'documents.licensePhoto': docs.licensePhoto ? {
              url: docs.licensePhoto,
              uploadedAt: new Date(),
              verified: false
            } : null,
            'documents.vehicleRegistration': docs.vehicleRegistration ? {
              url: docs.vehicleRegistration,
              uploadedAt: new Date(),
              verified: false
            } : null,
            'documents.insurance': docs.insurance ? {
              url: docs.insurance,
              uploadedAt: new Date(),
              verified: false
            } : null,
            'documents.profilePhoto': docs.profilePhoto ? {
              url: docs.profilePhoto,
              uploadedAt: new Date(),
              verified: false
            } : null
          }
        }
      );
    }
  }
});

print("Migration completed!");
```

---

### **6. Testing Checklist**

#### **A. Backend API Tests**
```bash
# 1. Wallet Top-Up
curl -X POST https://tech-ride.onrender.com/api/users/wallet/topup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "method": "PAYSTACK"}'

# 2. Get Banks List
curl https://tech-ride.onrender.com/api/banks \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Verify Bank Account
curl -X POST https://tech-ride.onrender.com/api/banks/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountNumber": "0123456789", "bankCode": "058"}'

# 4. Request Driver Payout
curl -X POST https://tech-ride.onrender.com/api/drivers/payout \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000}'
```

#### **B. Complete Ride Flow Test**

**As Rider:**
1. ✅ Register/Login
2. ✅ Add money to wallet (Paystack)
3. ✅ Request ride with wallet payment
4. ✅ Verify wallet charged immediately
5. ✅ Track driver in real-time
6. ✅ Complete ride
7. ✅ Rate driver

**As Driver:**
1. ✅ Register/Login
2. ✅ Upload documents (license, registration, insurance, photo)
3. ✅ Wait for admin approval
4. ✅ Go online
5. ✅ Accept ride
6. ✅ Navigate to pickup (Maps working!)
7. ✅ Start ride
8. ✅ Complete ride
9. ✅ See earnings in availableBalance
10. ✅ Add bank details
11. ✅ Request payout
12. ✅ Verify money in bank (10-30 min)

**As Admin:**
1. ✅ Login to admin dashboard
2. ✅ Approve driver documents
3. ✅ View pending payments
4. ✅ Monitor revenue

---

### **7. Post-Deployment Monitoring**

#### **A. Check Logs**
```bash
# Render Dashboard
1. Go to Logs tab
2. Check for errors
3. Monitor payment processing
```

#### **B. Monitor Key Metrics**
```
- Active drivers online
- Ride completion rate
- Payment success rate
- Average payout time
- API response times
```

#### **C. Setup Alerts**
```
1. Paystack webhook failures
2. High API error rates
3. Database connection issues
4. Low wallet balances
```

---

## 🎯 **POST-LAUNCH ACTIONS**

### **Week 1: Driver Onboarding**
```
1. Launch "First 500 Drivers" campaign
   - ₦20,000 bonus for 10 completed rides
   - Zero commission first month
   - Free branded materials

2. Setup driver support
   - WhatsApp group for quick help
   - 24/7 phone support line
   - Training videos

3. Monitor issues
   - Payment failures
   - Navigation problems
   - Document upload issues
```

### **Week 2: Rider Acquisition**
```
1. Student discount (20% off with .edu.ng email)
2. Referral program (₦500 for both)
3. Social media launch
4. Partnership with universities
```

### **Week 3-4: Optimization**
```
1. Add driver quest system
2. Build in-app chat UI
3. Implement split payments
4. Add scheduled rides UI
5. Launch in 2nd city
```

---

## 🆘 **TROUBLESHOOTING**

### **Issue: Maps Not Working**
```
✓ Check GOOGLE_MAPS_API_KEY in .env
✓ Verify API key has correct APIs enabled
✓ Check API key restrictions (bundle IDs)
✓ Rebuild app after changing .env
```

### **Issue: Driver Payout Fails**
```
✓ Check Paystack secret key
✓ Verify bank code is correct
✓ Check driver has sufficient balance
✓ Verify account number (10 digits)
✓ Check Paystack balance (needs funds for transfers)
```

### **Issue: Wallet Top-Up Not Working**
```
✓ Check Paystack public key in rider app
✓ Verify webhook URL set correctly
✓ Test payment on Paystack dashboard
✓ Check payment verification endpoint
```

### **Issue: Real-Time Tracking Not Working**
```
✓ Check Socket.IO connection
✓ Verify SOCKET_URL in app .env
✓ Check location permissions granted
✓ Test on physical device (not simulator)
```

---

## 📊 **EXPECTED COSTS**

### **Monthly Infrastructure:**
```
- Render (Backend): $0 (Free tier) or $7/month (Starter)
- Render (Admin): $0 (Free tier) or $7/month (Starter)  
- MongoDB Atlas: $0 (Free tier) or $57/month (M10)
- Google Maps API: ~$50-200/month (based on usage)
- Paystack: 1.5% + ₦100 per transaction
- Total: $57-271/month
```

### **One-Time:**
```
- Apple Developer: $99/year
- Google Play: $25 one-time
- Domain name: $10/year
- SSL Certificate: Free (Let's Encrypt)
```

---

## ✅ **FINAL CHECKLIST**

Before going live:

- [ ] All 5 critical fixes deployed
- [ ] Google Maps API key added to both apps
- [ ] Paystack keys configured (live, not test)
- [ ] Backend deployed and responding
- [ ] Apps built and tested on real devices
- [ ] Database migration completed (if needed)
- [ ] Complete ride flow tested end-to-end
- [ ] Bank account verified with test payout
- [ ] Wallet top-up tested with real payment
- [ ] Admin dashboard accessible
- [ ] Monitoring and alerts setup
- [ ] Support channels ready
- [ ] Launch marketing prepared

---

## 🚀 **YOU'RE READY TO LAUNCH!**

Your platform is now production-ready with:
- ✅ Secure payment processing
- ✅ Working driver payouts
- ✅ Functional wallet system
- ✅ Real-time navigation
- ✅ Complete ride workflows
- ✅ Competitive advantages (crypto, multi-language, lower commission)

**Next:** Execute your driver acquisition campaign and start onboarding riders!

**Good luck with your launch! 🎉**
