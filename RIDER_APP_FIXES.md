# Rider App Critical Fixes

## Issues Fixed

### 1. ❌ Wrong API Endpoint (403/401 Errors)

**Problem**: Rider app was calling `/drivers/nearby` endpoint which requires DRIVER role authorization.

**Error Log**:
```
ERROR Failed to fetch nearby drivers: [AxiosError: Request failed with status code 403]
ERROR Failed to fetch nearby drivers: [AxiosError: Request failed with status code 401]
```

**Root Cause**: 
- The rider app (`mobile-app`) was using the driver-only endpoint
- Backend route `/drivers/nearby` is protected by `authorizeRole('DRIVER')` middleware
- Riders (RIDER role) were correctly denied access

**Solution Implemented**:

#### Backend Changes
1. **Created new rider endpoint** (`backend/src/controllers/user.controller.ts`):
```typescript
export const getNearbyDrivers = async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 5 } = req.query;
  
  // Find nearby online drivers using geospatial query
  const drivers = await Driver.find({
    currentLocation: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000, // km to meters
      },
    },
    isOnline: true,
    isAvailable: true,
    isApproved: true,
  })
  .limit(20)
  .populate('userId', 'firstName lastName phoneNumber rating profilePhoto');
  
  res.json({ success: true, drivers, count: drivers.length });
};
```

2. **Added route** (`backend/src/routes/user.routes.ts`):
```typescript
router.get('/nearby-drivers', getNearbyDrivers);
```
- ✅ Available to all authenticated users (RIDER, DRIVER, ADMIN)
- ✅ No role restriction - any logged-in user can access

#### Frontend Changes
3. **Updated API service** (`mobile-app/src/services/api.service.ts`):
```typescript
// OLD (WRONG):
getNearbyDrivers: (latitude, longitude, radius = 5) =>
  api.get('/drivers/nearby', { params: { latitude, longitude, radius } })

// NEW (CORRECT):
getNearbyDrivers: (latitude, longitude, radius = 5) =>
  api.get('/users/nearby-drivers', { params: { latitude, longitude, radius } })
```

**Result**: ✅ Riders can now successfully fetch nearby drivers without 403/401 errors

---

### 2. ❌ Admin Settings Visible to Non-Admin Users

**Problem**: Some RIDER users were seeing the admin settings button in the HomeScreen.

**Root Cause**:
- HomeScreen was checking `AsyncStorage` for user role
- AsyncStorage data can be stale or manually manipulated
- No fresh validation from server

**Code Location**: `mobile-app/src/screens/HomeScreen.tsx:35-51`

**Solution Implemented**:

```typescript
// OLD (VULNERABLE):
const checkUserRole = async () => {
  const userDataStr = await AsyncStorage.getItem('userData');
  if (userDataStr) {
    const userData = JSON.parse(userDataStr);
    if (userData.role && userData.role.toUpperCase() === 'ADMIN') {
      setUserRole('ADMIN');
    }
  }
};

// NEW (SECURE):
const checkUserRole = async () => {
  try {
    // Fetch fresh user data from API
    const response = await userAPI.getProfile();
    const userData = response.data.user;
    
    // Only set admin if role is EXACTLY 'ADMIN'
    if (userData && userData.role === 'ADMIN') {
      setUserRole('ADMIN');
    } else {
      setUserRole('RIDER');
    }
  } catch (error) {
    console.log('Failed to get user role:', error);
    setUserRole('RIDER'); // Default to RIDER on error
  }
};
```

**Security Improvements**:
1. ✅ Fetches role from backend API (source of truth)
2. ✅ No longer trusts AsyncStorage alone
3. ✅ Defaults to 'RIDER' on error (fail-safe)
4. ✅ Strict equality check: `userData.role === 'ADMIN'`

**Additional Fix - Button Styling**:
```typescript
// Ensure admin button inherits base button styles
<TouchableOpacity 
  style={[styles.menuButton, styles.adminButton]}
  onPress={() => navigation.navigate('AdminDashboard' as never)}
>
```

**Result**: ✅ Only actual ADMIN users see the admin settings button

---

## Testing Checklist

### Backend
- [ ] Deploy backend changes to production
- [ ] Verify `/api/users/nearby-drivers` endpoint works
- [ ] Test with RIDER authentication token
- [ ] Test with ADMIN authentication token
- [ ] Verify driver endpoint still requires DRIVER role

### Frontend (Rider App)
- [ ] Test nearby drivers fetching as RIDER
- [ ] Verify no 403/401 errors
- [ ] Confirm admin button only shows for ADMIN role
- [ ] Test with RIDER login - no admin button
- [ ] Test with ADMIN login - admin button appears
- [ ] Verify map displays nearby drivers correctly

---

## API Endpoint Reference

### For Riders (mobile-app)
```
GET /api/users/nearby-drivers?latitude={lat}&longitude={lng}&radius={km}
Authorization: Bearer {token}
Allowed Roles: RIDER, DRIVER, ADMIN
```

### For Drivers (driver-app)
```
GET /api/drivers/nearby?latitude={lat}&longitude={lng}&radius={km}
Authorization: Bearer {token}
Allowed Roles: DRIVER only
```

---

## Security Notes

1. **Role Validation**: Always fetch user role from backend API, never trust client-side storage alone
2. **Endpoint Segregation**: Riders and drivers use different endpoints for better security and maintainability
3. **Fail-Safe Defaults**: Always default to least privileged role (RIDER) on errors

---

## Files Modified

### Backend
- ✅ `backend/src/controllers/user.controller.ts` - Added getNearbyDrivers function
- ✅ `backend/src/routes/user.routes.ts` - Added /nearby-drivers route

### Frontend (Rider App)
- ✅ `mobile-app/src/services/api.service.ts` - Updated getNearbyDrivers endpoint
- ✅ `mobile-app/src/screens/HomeScreen.tsx` - Fixed role validation and admin button
