# 📘 Quick Reference Guide

## 🚀 Getting Started Commands

### Start Everything at Once
```bash
./start.sh
```

### Individual Services

#### Backend
```bash
cd backend
npm run dev              # Development mode
npm run build            # Production build
npm start               # Production mode
```

#### Mobile App
```bash
cd mobile-app
npm start               # Start Expo
npm run ios             # iOS simulator
npm run android         # Android emulator
```

#### Admin Dashboard
```bash
cd admin-dashboard
npm run dev             # Development
npm run build           # Production build
npm start               # Production
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ridehailing

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Redis
REDIS_URL=redis://localhost:6379

# Google Maps
GOOGLE_MAPS_API_KEY=your-key

# Twilio SMS
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Pricing
COMMISSION_RATE=0.15
BASE_FARE=2.50
COST_PER_KM=1.20
COST_PER_MINUTE=0.30
```

---

## 📡 API Quick Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### Key Endpoints

#### Auth
```bash
POST /auth/register      # Register new user
POST /auth/login         # Login
POST /auth/verify-otp    # Verify OTP
```

#### Rides
```bash
POST /rides/request      # Request ride
GET  /rides/:id          # Get ride details
POST /rides/:id/accept   # Accept ride (driver)
POST /rides/:id/cancel   # Cancel ride
POST /rides/:id/start    # Start ride
POST /rides/:id/complete # Complete ride
GET  /rides/history/all  # Get history
```

#### Users
```bash
GET  /users/profile      # Get profile
PUT  /users/profile      # Update profile
GET  /users/wallet       # Get wallet
POST /users/wallet/topup # Topup wallet
```

---

## 🔌 Socket.IO Events

### Connect
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

### Listen to Events
```javascript
// Ride accepted
socket.on('ride-accepted', (data) => {
  console.log('Driver accepted:', data);
});

// Driver location update
socket.on('location-update', (data) => {
  console.log('Driver location:', data.latitude, data.longitude);
});

// Ride started
socket.on('ride-started', (data) => {
  console.log('Ride started');
});
```

### Emit Events
```javascript
// Update driver location
socket.emit('update-location', {
  latitude: 37.7749,
  longitude: -122.4194
});

// Send message
socket.emit('send-message', {
  rideId: 'ride-id',
  message: 'Hello',
  recipientId: 'user-id'
});
```

---

## 🗄️ Database Commands

### Prisma
```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Push schema without migration
npx prisma db push
```

### PostgreSQL
```bash
# Connect to database
psql ridehailing

# Backup
pg_dump ridehailing > backup.sql

# Restore
psql ridehailing < backup.sql

# Check connections
psql -c "SELECT * FROM pg_stat_activity;"
```

---

## 🧪 Testing

### Test Ride Flow
1. Start backend: `cd backend && npm run dev`
2. Start mobile app: `cd mobile-app && npm start`
3. Register new user
4. Request a ride
5. Monitor in admin dashboard

### Test Accounts
```javascript
// Rider
{
  phone: "+1234567890",
  password: "test123"
}

// Driver
{
  phone: "+1987654321",
  password: "driver123"
}
```

---

## 🐛 Common Issues & Fixes

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### PostgreSQL Not Running
```bash
# Mac (Homebrew)
brew services start postgresql@14

# Check status
brew services list

# Manual start
pg_ctl -D /usr/local/var/postgres start
```

### Redis Not Running
```bash
# Mac (Homebrew)
brew services start redis

# Check if running
redis-cli ping  # Should return PONG

# Manual start
redis-server
```

### Prisma Client Out of Sync
```bash
cd backend
npx prisma generate
npm run dev
```

### Expo Not Loading
```bash
cd mobile-app
# Clear cache
expo start -c

# Or
rm -rf .expo node_modules
npm install
npm start
```

---

## 📱 Mobile App Navigation

### Screen Structure
```
- Splash Screen (Initial)
  ├── Onboarding (First time)
  └── Login
      ├── Register
      └── Home
          ├── Profile
          ├── Wallet
          ├── RideHistory
          ├── RideRequest
          └── RideTracking
```

### Navigation Code
```javascript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// Navigate to screen
navigation.navigate('Home');

// Go back
navigation.goBack();

// Replace screen
navigation.replace('Login');
```

---

## 💳 Payment Testing

### Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Test Payment Flow
```javascript
// Create payment intent
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 10.50,
    rideId: 'ride-123'
  })
});

const { clientSecret } = await response.json();
```

---

## 📊 Monitoring

### Check Backend Health
```bash
curl http://localhost:5000/health
```

### View Logs
```bash
# Backend logs
cd backend
npm run dev  # Logs to console

# Or use PM2
pm2 logs backend
```

### Database Monitoring
```bash
# Active connections
psql ridehailing -c "SELECT count(*) FROM pg_stat_activity;"

# Table sizes
psql ridehailing -c "SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

---

## 🚀 Deployment Quick Guide

### Backend (Heroku)
```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add Redis
heroku addons:create heroku-redis:mini

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

### Mobile App (Expo EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Submit
eas submit --platform ios
eas submit --platform android
```

---

## 📞 Support Checklist

### User Reporting Issue
1. Check server status
2. Check user account (database)
3. Check ride status
4. Review error logs
5. Test similar scenario
6. Fix and communicate

### Driver Reporting Issue
1. Verify driver status
2. Check location permissions
3. Test socket connection
4. Review ride assignments
5. Check earnings calculation
6. Resolve and document

---

## 🎯 KPIs to Track

### Daily
- Active drivers
- Completed rides
- Average rating
- Completion rate
- Revenue

### Weekly
- New users
- Driver retention
- Rider retention
- Peak hour performance
- Support tickets

### Monthly
- GMV (Gross Merchandise Value)
- Commission earned
- User growth rate
- Driver growth rate
- Churn rate

---

## 📱 Useful Commands

### Git
```bash
# Commit changes
git add .
git commit -m "Feature: description"
git push origin main

# Create branch
git checkout -b feature/new-feature

# Merge
git checkout main
git merge feature/new-feature
```

### NPM
```bash
# Update dependencies
npm update

# Check outdated
npm outdated

# Audit security
npm audit
npm audit fix

# Clear cache
npm cache clean --force
```

### System
```bash
# Check Node version
node -v

# Check npm version
npm -v

# Check running processes
ps aux | grep node

# Check disk space
df -h

# Check memory
free -m  # Linux
vm_stat  # Mac
```

---

**Keep this handy for quick lookups! 📚**
