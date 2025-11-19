# 🧪 TechRide Platform - Complete Testing Guide

**Status:** Ready for Testing  
**Last Updated:** November 19, 2024

---

## 📊 Testing Progress Summary

| Component | API Tests | Integration Tests | E2E Tests | Status |
|-----------|-----------|-------------------|-----------|--------|
| **Backend** | ✅ Ready | ✅ Ready | ⚠️ Manual | 100% |
| **Driver App** | ✅ Ready | ⚠️ Pending | ⚠️ Pending | 85% |
| **Rider App** | ✅ Ready | ⚠️ Pending | ⚠️ Pending | 95% |
| **Admin Dashboard** | ✅ Ready | ⚠️ Pending | ⚠️ Pending | 90% |

---

## 🎯 Priority 3: End-to-End Testing

### Phase 1: Backend API Testing (2 hours)

#### Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your MongoDB URI and API keys
npm run dev
```

#### Test Endpoints with Thunder Client/Postman

**1. Authentication Flow**
```http
# Register User
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "phoneNumber": "08012345678",
  "email": "test@example.com",
  "password": "password123",
  "role": "RIDER"
}

# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "password": "password123"
}

# Verify OTP
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "otp": "123456"
}
```

**2. Ride Flow**
```http
# Request Ride
POST http://localhost:5000/api/rides/request
Authorization: Bearer {token}
Content-Type: application/json

{
  "pickupLocation": {
    "address": "123 Lagos Street",
    "coordinates": [6.5244, 3.3792]
  },
  "dropoffLocation": {
    "address": "456 Victoria Island",
    "coordinates": [6.4281, 3.4219]
  },
  "vehicleType": "ECONOMY"
}

# Calculate Fare
POST http://localhost:5000/api/rides/calculate-fare
Content-Type: application/json

{
  "pickupLocation": {
    "coordinates": [6.5244, 3.3792]
  },
  "dropoffLocation": {
    "coordinates": [6.4281, 3.4219]
  },
  "vehicleType": "ECONOMY"
}

# Get Ride History
GET http://localhost:5000/api/rides/history
Authorization: Bearer {token}
```

**3. Payment Methods**
```http
# Initialize Paystack Payment
POST http://localhost:5000/api/payments/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "rideId": "ride_id_here",
  "amount": 5000,
  "method": "PAYSTACK"
}

# Pay with Wallet
POST http://localhost:5000/api/payments/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "rideId": "ride_id_here",
  "amount": 5000,
  "method": "WALLET"
}

# Crypto Payment
POST http://localhost:5000/api/payments/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "rideId": "ride_id_here",
  "amount": 5000,
  "method": "CRYPTO",
  "currency": "BTC"
}
```

**4. Driver APIs**
```http
# Register as Driver
POST http://localhost:5000/api/drivers/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "vehicleType": "ECONOMY",
  "vehicleMake": "Toyota",
  "vehicleModel": "Corolla",
  "vehicleYear": "2020",
  "vehicleColor": "Black",
  "licensePlate": "ABC-123-XYZ"
}

# Update Driver Status
PUT http://localhost:5000/api/drivers/status
Authorization: Bearer {driver_token}
Content-Type: application/json

{
  "isOnline": true
}

# Get Earnings
GET http://localhost:5000/api/drivers/earnings?period=today
Authorization: Bearer {driver_token}
```

---

### Phase 2: Driver App Testing (3-4 hours)

#### Installation
```bash
cd driver-app
npm install
```

#### iOS Setup
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

#### Android Setup
```bash
npx react-native run-android
```

#### Test Checklist

**Authentication:** ✅/❌
- [ ] Register as driver
- [ ] Login with credentials
- [ ] OTP verification
- [ ] Logout

**Dashboard:** ✅/❌
- [ ] Online/Offline toggle works
- [ ] Today's earnings display
- [ ] Stats show correctly
- [ ] Location permissions granted

**Ride Flow:** ✅/❌
- [ ] Receive ride request notification
- [ ] Sound plays on new request
- [ ] Accept ride
- [ ] Navigate to pickup (Google Maps opens)
- [ ] Mark as arrived
- [ ] Start ride
- [ ] Complete ride
- [ ] Earnings updated

**Real-time:** ✅/❌
- [ ] Socket connection established
- [ ] Location updates sent every 5s
- [ ] Receive messages from rider
- [ ] Status updates work

**Profile:** ✅/❌
- [ ] View profile
- [ ] Update vehicle info
- [ ] View ride history
- [ ] Check earnings history

---

### Phase 3: Rider App Testing (2-3 hours)

#### Test Checklist

**Authentication:** ✅/❌
- [ ] Register as rider
- [ ] Login
- [ ] OTP verification
- [ ] Profile update

**Booking:** ✅/❌
- [ ] Set pickup location
- [ ] Set dropoff location
- [ ] See fare estimate
- [ ] Apply promo code
- [ ] Request ride

**Payment:** ✅/❌
- [ ] Card payment (Paystack)
- [ ] Wallet payment
- [ ] Crypto payment (BTC/ETH/USDT)
- [ ] Cash payment
- [ ] Payment confirmation

**Tracking:** ✅/❌
- [ ] See driver location in real-time
- [ ] Driver info displayed
- [ ] ETA updates
- [ ] Driver arrival notification
- [ ] In-ride messaging

**History:** ✅/❌
- [ ] View past rides
- [ ] Rate completed ride
- [ ] View receipts

---

### Phase 4: Admin Dashboard Testing (2 hours)

#### Setup
```bash
cd admin-dashboard
npm install
cp .env.example .env
npm run dev
```

#### Test Checklist

**Dashboard:** ✅/❌
- [ ] Stats load correctly
- [ ] Recent rides display
- [ ] Pending drivers shown
- [ ] Revenue analytics

**Driver Management:** ✅/❌
- [ ] View all drivers
- [ ] Approve pending drivers
- [ ] Block/unblock drivers
- [ ] View driver details

**User Management:** ✅/❌
- [ ] View all users
- [ ] Block/unblock users
- [ ] View user details
- [ ] Search users

**Ride Management:** ✅/❌
- [ ] View all rides
- [ ] Filter by status
- [ ] View ride details
- [ ] Cancel ride (if needed)

**Promo Codes:** ✅/❌
- [ ] Create promo code
- [ ] Edit promo code
- [ ] Delete promo code
- [ ] View usage stats

---

## 🚨 Critical Test Scenarios

### Scenario 1: Complete Ride Flow (30 min)

1. **Rider books ride**
   - Open rider app
   - Set locations
   - Request ride with card payment

2. **Driver accepts**
   - Driver receives notification
   - Accepts ride
   - Navigates to pickup

3. **Driver arrives**
   - Marks as arrived
   - Rider gets notification

4. **Start ride**
   - Driver starts ride
   - Location tracking active

5. **Complete ride**
   - Driver completes
   - Payment processed
   - Both rate each other

**Expected Result:** ✅ Full flow completes without errors

---

### Scenario 2: Payment Methods (20 min)

Test each payment method:
1. **Paystack** - Card payment
2. **Wallet** - Deduct from balance
3. **Crypto** - BTC payment
4. **Cash** - Pay driver directly

**Expected Result:** ✅ All methods process correctly

---

### Scenario 3: Driver Onboarding (15 min)

1. Register as new driver
2. Submit documents
3. Admin reviews and approves
4. Driver goes online
5. Receives first ride request

**Expected Result:** ✅ Smooth onboarding flow

---

### Scenario 4: Multi-language (10 min)

1. Change language to Yoruba
2. Request ride
3. Check all text translated
4. Switch to Hausa
5. Verify translations

**Expected Result:** ✅ All languages work

---

### Scenario 5: Referral System (10 min)

1. User A refers User B
2. User B registers with code
3. User B takes first ride
4. Check both wallets credited

**Expected Result:** ✅ Referral rewards applied

---

## 📝 Test Results Template

### Backend API Tests
```
✅ Authentication - PASSED
✅ Ride Management - PASSED
⚠️ Payment Processing - NEEDS REVIEW
❌ Notifications - FAILED (reason)

Issues Found:
1. [Issue description]
2. [Issue description]
```

### Driver App Tests
```
✅ Login/Register - PASSED
✅ Ride Acceptance - PASSED
⚠️ Navigation - NEEDS GOOGLE MAPS API KEY
❌ [Feature] - FAILED (reason)

Issues Found:
1. [Issue description]
2. [Issue description]
```

### Rider App Tests
```
✅ Booking Flow - PASSED
✅ Payment Methods - PASSED
⚠️ [Feature] - NEEDS REVIEW
❌ [Feature] - FAILED (reason)

Issues Found:
1. [Issue description]
2. [Issue description]
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to backend"
**Solution:** 
- Check backend is running on port 5000
- Verify `API_URL` in .env files
- Check firewall settings

### Issue 2: "Google Maps not loading"
**Solution:**
- Add Google Maps API key to .env
- Enable Maps SDK for iOS/Android
- Check billing enabled

### Issue 3: "Socket connection failed"
**Solution:**
- Verify Socket.IO URL correct
- Check auth token valid
- Ensure backend Socket.IO running

### Issue 4: "Payment initialization failed"
**Solution:**
- Verify Paystack keys correct
- Check backend payment service
- Validate ride amount

### Issue 5: "Location permissions denied"
**Solution:**
- Request permissions in app
- Check AndroidManifest.xml
- Verify Info.plist for iOS

---

## ✅ Testing Sign-off

**Backend:** ☐ All tests passed  
**Driver App:** ☐ All tests passed  
**Rider App:** ☐ All tests passed  
**Admin Dashboard:** ☐ All tests passed

**Tested By:** _____________  
**Date:** _____________  
**Approved:** ☐ Yes ☐ No

---

## 🚀 Next Steps After Testing

1. **Fix critical bugs**
2. **Deploy to staging**
3. **Run tests on staging**
4. **Deploy to production**
5. **Monitor logs**
6. **Soft launch**

---

**Ready to test! 🧪**
