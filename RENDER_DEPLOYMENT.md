# 🚀 TechRide - Render Production Deployment Guide

## Prerequisites

1. **GitHub Repository** - Code pushed to GitHub
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas** - Free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
4. **Payment Services** - Paystack account for Nigerian payments

---

## Step 1: Setup MongoDB Atlas (5 minutes)

### Create MongoDB Cluster
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Click **"Build a Database"**
4. Choose **"M0 FREE"** tier
5. Select **AWS** → **Oregon (us-west-2)** (same region as Render)
6. Name your cluster: `techride-production`
7. Create cluster (takes 3-5 minutes)

### Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/techride?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user credentials

### Setup Database Access
1. **Database Access** → **Add New Database User**
   - Username: `techride-app`
   - Password: Generate secure password (save it!)
   - Database User Privileges: **Read and write to any database**

2. **Network Access** → **Add IP Address**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This allows Render to connect

---

## Step 2: Deploy to Render (10 minutes)

### A. Backend Deployment

1. **Go to Render Dashboard** → [dashboard.render.com](https://dashboard.render.com)

2. **Click "New +"** → **"Web Service"**

3. **Connect GitHub Repository**
   - Grant Render access to your GitHub
   - Select: `GIDEONSTECHNOLOGYLTD/tech-ride`

4. **Configure Service:**
   ```yaml
   Name: techride-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Starter ($7/month)
   ```

5. **Add Environment Variables** (click "Advanced"):
   ```env
   NODE_ENV=production
   PORT=5000
   
   # MongoDB Atlas (YOUR CONNECTION STRING)
   MONGODB_URI=mongodb+srv://techride-app:YOUR_PASSWORD@cluster.mongodb.net/techride?retryWrites=true&w=majority
   
   # JWT (Auto-generated or use your own)
   JWT_SECRET=your-super-secret-jwt-key-production-change-this-now
   JWT_EXPIRE=7d
   
   # Paystack (Get from paystack.com dashboard)
   PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
   
   # Google Maps (Get from console.cloud.google.com)
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # Twilio (Optional for SMS)
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   
   # Firebase (Optional for push notifications)
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   
   # Pricing (Nigerian Naira)
   COMMISSION_RATE=0.15
   BASE_FARE_ECONOMY=500
   BASE_FARE_COMFORT=800
   BASE_FARE_XL=1200
   BASE_FARE_BIKE=300
   COST_PER_KM_ECONOMY=120
   COST_PER_KM_COMFORT=150
   COST_PER_KM_XL=200
   COST_PER_KM_BIKE=80
   COST_PER_MINUTE=30
   REFERRER_REWARD=1000
   REFERRED_USER_REWARD=500
   ```

6. **Health Check Path**: `/health`

7. **Click "Create Web Service"**

8. Wait 5-10 minutes for deployment. Your backend will be at:
   ```
   https://tech-ride.onrender.com
   ```

### B. Admin Dashboard Deployment

1. **Click "New +"** → **"Web Service"**

2. **Select same GitHub repository**

3. **Configure Service:**
   ```yaml
   Name: techride-admin
   Region: Oregon (US West)
   Branch: main
   Root Directory: admin-dashboard
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Starter ($7/month)
   ```

4. **Add Environment Variables:**
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://tech-ride.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://tech-ride.onrender.com
   ```

5. **Click "Create Web Service"**

6. Your admin dashboard will be at:
   ```
   https://techride-admin.onrender.com
   ```

---

## Step 3: Verify Deployment (5 minutes)

### Test Backend
```bash
# Health check
curl https://tech-ride.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Test Admin Dashboard
1. Open: `https://techride-admin.onrender.com`
2. Dashboard should load (may show "Authentication required" - normal!)

### Test MongoDB Connection
- Check Render logs for: `✅ MongoDB connected successfully`

---

## Step 4: Create First Admin User

### Option A: Using API
```bash
curl -X POST https://tech-ride.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "email": "admin@techride.com"
  }'
```

### Option B: Using MongoDB Atlas
1. Go to MongoDB Atlas → **Browse Collections**
2. Create collection: `users`
3. Insert document:
   ```json
   {
     "firstName": "Admin",
     "lastName": "User",
     "phoneNumber": "+2348012345678",
     "email": "admin@techride.com",
     "password": "$2a$10$hashed_password_here",
     "role": "ADMIN",
     "isVerified": true,
     "walletBalance": 0,
     "createdAt": new Date(),
     "updatedAt": new Date()
   }
   ```

---

## 💰 Costs Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **Render Backend** | Starter | $7/month |
| **Render Admin** | Starter | $7/month |
| **MongoDB Atlas** | M0 Free | $0/month |
| **Domain (Optional)** | Namecheap | $10/year |
| **Total Monthly** | | **$14/month** |

### Free Tier Limits
- MongoDB: 512 MB storage, shared CPU
- Render Free (if you choose): App sleeps after 15 min inactivity

---

## 🔐 Security Checklist

- [ ] Changed JWT_SECRET to strong random string
- [ ] Using MongoDB Atlas password authentication
- [ ] MongoDB network access configured
- [ ] Environment variables set (not committed to Git)
- [ ] HTTPS enabled on Render (automatic)
- [ ] Paystack live keys (not test keys)
- [ ] Firebase credentials secured

---

## 🚀 Post-Deployment

### Update Backend CORS (if needed)
Edit `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: [
    'https://techride-admin.onrender.com',
    'http://localhost:3001' // Keep for local dev
  ],
  credentials: true
}));
```

### Monitor Logs
- **Render Dashboard** → Your Service → **Logs**
- Check for errors after deployment

### Setup Custom Domain (Optional)
1. Buy domain (e.g., `techride.ng`)
2. Render Dashboard → Service → **Settings** → **Custom Domain**
3. Add DNS records from Render to your domain provider

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check Render logs for errors
- Verify MongoDB connection string
- Check all required env vars are set

### Admin Dashboard Shows Error
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Look at browser console for errors

### MongoDB Connection Failed
- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify database user credentials
- Check connection string format

### Socket.IO Not Working
- Render Starter plan supports WebSockets ✅
- Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly

---

## 📱 Next Steps

1. **Deploy Mobile Apps**
   - Driver App → Google Play Store
   - Rider App → Google Play Store / App Store

2. **Setup Payment Webhooks**
   - Paystack Dashboard → Settings → Webhooks
   - URL: `https://tech-ride.onrender.com/api/payments/webhook`

3. **Configure Firebase Push Notifications**
   - Add FCM credentials to environment

4. **Setup Monitoring**
   - Use Render metrics
   - Add Sentry for error tracking

---

## 🎉 You're Live!

Your **TechRide platform** is now live at:
- **Backend API**: `https://tech-ride.onrender.com`
- **Admin Dashboard**: `https://techride-admin.onrender.com`

**Total time to deploy: ~20 minutes** 🚀

Ready to compete with Uber & Bolt! 🚗💨
