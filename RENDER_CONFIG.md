# 🎯 Exact Render Configuration Values

## When You Click "New Web Service" on Render

---

## 1️⃣ Backend API Configuration

### Basic Settings
```
Name: techride-backend
Environment: Node  ← SELECT THIS (not Docker!)
Region: Oregon (US West)
Branch: main
Root Directory: backend
```

### Build & Deploy Settings
```
Build Command:
npm install && npm run build

Start Command:
npm start

Auto-Deploy: Yes
```

### Environment Variables
Click "Add Environment Variable" for each:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techride
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
PAYSTACK_SECRET_KEY=sk_live_your_key
GOOGLE_MAPS_API_KEY=your_key
```

### Advanced Settings
```
Health Check Path: /health
```

---

## 2️⃣ Admin Dashboard Configuration

### Basic Settings
```
Name: techride-admin
Environment: Node  ← SELECT THIS (not Docker!)
Region: Oregon (US West)
Branch: main
Root Directory: admin-dashboard
```

### Build & Deploy Settings
```
Build Command:
npm install && npm run build

Start Command:
npm start

Auto-Deploy: Yes
```

### Environment Variables
Click "Add Environment Variable" for each:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://techride-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://techride-backend.onrender.com
```

---

## ❓ Why Node and NOT Docker?

### Use **Node** Environment Because:
✅ Simpler - Render handles everything
✅ Faster builds
✅ Auto-detects package.json
✅ No Dockerfile needed
✅ Better for Node.js/Next.js apps

### When to Use Docker:
❌ Complex multi-service apps
❌ Custom system dependencies
❌ Non-Node.js languages

**For this project: Always select "Node"** 🎯

---

## 📋 Step-by-Step Checklist

### Backend Deployment
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repo: `GIDEONSTECHNOLOGYLTD/tech-ride`
- [ ] Name: `techride-backend`
- [ ] Environment: **Node** (from dropdown)
- [ ] Region: Oregon (US West)
- [ ] Branch: `main`
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Add all environment variables
- [ ] Health Check Path: `/health`
- [ ] Click "Create Web Service"

### Admin Deployment
- [ ] Click "New +" → "Web Service"
- [ ] Select same GitHub repo
- [ ] Name: `techride-admin`
- [ ] Environment: **Node** (from dropdown)
- [ ] Region: Oregon (US West)
- [ ] Branch: `main`
- [ ] Root Directory: `admin-dashboard`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Add environment variables
- [ ] Click "Create Web Service"

---

## 🚨 Common Mistakes to Avoid

### ❌ WRONG
```
Environment: Docker
Build Command: docker build -t app .
Start Command: docker run app
Root Directory: (empty)
```

### ✅ CORRECT
```
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
Root Directory: backend  (or admin-dashboard)
```

---

## 💡 Why These Commands?

### Build Command: `npm install && npm run build`
1. `npm install` - Downloads all dependencies from package.json
2. `&&` - Then (only if first succeeds)
3. `npm run build` - Compiles TypeScript to JavaScript (runs `tsc`)

### Start Command: `npm start`
1. Runs the "start" script from package.json
2. For backend: `node dist/server.js`
3. For admin: Next.js production server

---

## 🔍 What Render Does Automatically

When you select **Node** environment:
1. ✅ Detects Node.js version from package.json
2. ✅ Installs npm/yarn automatically
3. ✅ Sets up build environment
4. ✅ Handles port binding (PORT env var)
5. ✅ Manages SSL certificates (HTTPS)
6. ✅ Provides logs and monitoring

You just provide the commands! 🎉

---

## 📱 Your Final URLs After Deployment

```
Backend:  https://techride-backend.onrender.com
Admin:    https://techride-admin.onrender.com
```

Both will have automatic HTTPS! 🔒
