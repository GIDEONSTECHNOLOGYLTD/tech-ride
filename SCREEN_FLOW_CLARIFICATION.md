# 🗺️ SCREEN FLOW CLARIFICATION

**Understanding the Difference Between Payment Screens**

---

## 🎯 **TWO DIFFERENT PURPOSES**

### **1. PaymentMethodScreen (EXISTING)**
**Purpose:** Choose payment method **DURING A RIDE**  
**When:** After requesting a ride, before/during the ride  
**Navigation:** `RideRequestScreen → PaymentMethodScreen`  
**Access:** Also from `SettingsScreen → Payment Methods` (to manage saved cards)

**What it does:**
- Select how to pay for **THIS RIDE**
- Options: Wallet, Card, Crypto, Cash
- Shows wallet balance
- Shows ride amount to pay
- Processes payment for the ride

**File:** `mobile-app/src/screens/PaymentMethodScreen.tsx`

---

### **2. WalletTopUpScreen (NEW)**
**Purpose:** Add money TO your wallet  
**When:** User wants to top up wallet balance  
**Navigation:** `WalletScreen → WalletTopUp`

**What it does:**
- Add money to wallet (not for a specific ride)
- Choose amount (₦50-₦10,000 or custom)
- Choose payment method to ADD money
- Processes deposit to wallet

**File:** `mobile-app/src/screens/WalletTopUpScreen.tsx`

---

## 📊 **SCREEN RELATIONS**

```
USER JOURNEY 1: Request a Ride & Pay
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HomeScreen
    ↓
RideRequestScreen (enter destination)
    ↓
Select vehicle type
    ↓
See estimated fare
    ↓
PaymentMethodScreen ← Choose how to pay for THIS ride
    ├─ Wallet (if sufficient balance)
    ├─ Card (Paystack)
    ├─ Crypto (BTC/ETH/USDT)
    └─ Cash (pay driver)
    ↓
RideTrackingScreen (ride in progress)
    ↓
Ride completed


USER JOURNEY 2: Top Up Wallet Balance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ProfileScreen or HomeScreen
    ↓
WalletScreen (see balance & transactions)
    ↓
Tap "Top Up" button
    ↓
WalletTopUpScreen ← Add money to wallet
    ├─ Choose amount (₦50, ₦100, ₦200, etc.)
    ├─ Choose payment method to ADD money:
    │   ├─ Card (Paystack)
    │   ├─ Bank Transfer (Paystack)
    │   └─ Crypto
    ↓
PaystackWebViewScreen or CryptoTopUpScreen
    ↓
Payment verified
    ↓
Back to WalletScreen (balance updated)


USER JOURNEY 3: Manage Payment Methods (Settings)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SettingsScreen
    ↓
Tap "Payment Methods"
    ↓
PaymentMethodScreen (manage saved cards, set default)
    ↓
Can add/remove cards
    ↓
Can set default payment method
```

---

## 🔑 **KEY DIFFERENCES**

| Feature | PaymentMethodScreen | WalletTopUpScreen |
|---------|---------------------|-------------------|
| **Purpose** | Pay for a ride | Add money to wallet |
| **Amount** | Ride fare (from backend) | User chooses amount |
| **When** | During ride request | Anytime |
| **Wallet Option** | PAY from wallet | ADD to wallet |
| **Navigation From** | RideRequest or Settings | WalletScreen only |
| **Payment Flow** | Immediate (for ride) | Deposit (to wallet) |

---

## ✅ **NO CONFLICTS - DIFFERENT PURPOSES**

### **PaymentMethodScreen:**
- **For rides:** "How do you want to pay for this ride?"
- Shows ride amount
- Can use wallet if balance sufficient
- Also used in Settings to manage saved payment methods

### **WalletTopUpScreen:**
- **For wallet:** "How much do you want to add to your wallet?"
- User chooses amount
- Adds money TO wallet
- Only accessed from WalletScreen

---

## 🎨 **SCREEN HIERARCHY**

```
App Navigation
│
├─ Home
│   ├─ RideRequest
│   │   └─ PaymentMethodScreen (for ride)
│   │       └─ RideTracking
│   │
│   └─ Wallet
│       ├─ View balance
│       └─ WalletTopUpScreen (add money)
│           ├─ PaystackWebViewScreen
│           └─ CryptoTopUpScreen
│
├─ Profile
│   └─ Wallet (same as above)
│
└─ Settings
    ├─ Edit Profile
    ├─ Payment Methods ← PaymentMethodScreen (manage cards)
    ├─ Help Center
    └─ Logout
```

---

## 📝 **PROPER USAGE**

### **When User Wants to Take a Ride:**
1. Open app → HomeScreen
2. Enter destination → RideRequestScreen
3. **PaymentMethodScreen shows automatically**
4. Choose: Wallet, Card, Crypto, or Cash
5. Request ride

### **When User Wants to Add Money to Wallet:**
1. Go to Profile → Wallet OR HomeScreen → Wallet icon
2. See wallet balance
3. Tap "Top Up" button
4. **WalletTopUpScreen opens**
5. Choose amount
6. Choose payment method
7. Complete payment

### **When User Wants to Manage Saved Cards:**
1. Go to Settings
2. Tap "Payment Methods"
3. **PaymentMethodScreen opens** (in manage mode)
4. Add/remove cards
5. Set default payment

---

## 🔧 **WHAT I ADDED (No Conflicts)**

**New Screens:**
1. ✅ **WalletTopUpScreen** - Separate screen for wallet deposits
2. ✅ **CryptoTopUpScreen** - Handle crypto deposits
3. ✅ **PaystackWebViewScreen** - Handle Paystack redirects

**Modified Screens:**
1. ✅ **WalletScreen** - Added "Top Up" button → navigates to WalletTopUpScreen
2. ✅ **Fixed currency** - Changed $ to ₦ everywhere

**Untouched Screens:**
1. ✅ **PaymentMethodScreen** - Still works for ride payments
2. ✅ **SettingsScreen** - Still navigates to PaymentMethod for card management
3. ✅ **RideRequestScreen** - Still uses PaymentMethodScreen

---

## ⚠️ **IMPORTANT: Two Different Uses of PaymentMethodScreen**

The existing `PaymentMethodScreen` is used in **TWO CONTEXTS**:

### **Context 1: During Ride Request**
- Navigated from: `RideRequestScreen`
- Purpose: Choose payment for THIS ride
- Receives: `rideId`, `amount` as params
- Behavior: Process payment for ride

### **Context 2: From Settings**
- Navigated from: `SettingsScreen → Payment Methods`
- Purpose: Manage saved payment methods
- Receives: No params (or different params)
- Behavior: Add/remove/edit saved cards

**This is NORMAL and works correctly.**

---

## ✅ **VERIFICATION**

- [x] PaymentMethodScreen still works for rides
- [x] PaymentMethodScreen accessible from Settings
- [x] WalletTopUpScreen is separate (only for deposits)
- [x] No navigation conflicts
- [x] Each screen has distinct purpose
- [x] Currency fixed (₦ everywhere)
- [x] All flows documented

---

**Status:** ✅ No conflicts. All screens serve different purposes and work together properly.
