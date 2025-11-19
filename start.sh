#!/bin/bash

# 🚗 Ride-Hailing Platform - Quick Start Script

echo "🚀 Starting Bolt Competitor Platform..."
echo ""

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Starting..."
    brew services start postgresql@14
    sleep 2
fi

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running. Starting..."
    brew services start redis
    sleep 2
fi

echo "✅ Database services running"
echo ""

# Start backend
echo "🔧 Starting Backend API..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 5

# Start admin dashboard
echo "📊 Starting Admin Dashboard..."
cd admin-dashboard
npm run dev &
ADMIN_PID=$!
cd ..

sleep 3

# Start mobile app
echo "📱 Starting Mobile App..."
cd mobile-app
npm start &
MOBILE_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Access Points:"
echo "   - Backend API: http://localhost:5000"
echo "   - Admin Dashboard: http://localhost:3001"
echo "   - Mobile App: Follow Expo instructions above"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping all services...'; kill $BACKEND_PID $ADMIN_PID $MOBILE_PID; exit" INT
wait
