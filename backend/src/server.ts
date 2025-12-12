import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import MongoDB connection
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import driverRoutes from './routes/driver.routes';
import rideRoutes from './routes/ride.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import bankRoutes from './routes/bank.routes';

// Import socket handler
import { initializeSocketHandlers } from './socket/socket.handler';

// Import Firebase (optional for local dev)
let firebaseService: any;
try {
  firebaseService = require('./services/firebase.service').default;
} catch (error) {
  console.warn('⚠️  Firebase service not available');
}

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Firebase (optional)
if (firebaseService) {
  try {
    firebaseService.initialize();
  } catch (error) {
    console.warn('⚠️  Firebase not initialized - continuing without push notifications');
  }
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Multi-language support (optional for local dev)
// app.use(i18nextMiddleware.handle(i18next));

// Rate limiting - Global per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later' },
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later' },
  skipSuccessfulRequests: true,
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'TechRide API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to TechRide Backend API',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      drivers: '/api/drivers',
      rides: '/api/rides',
      payments: '/api/payments',
      admin: '/api/admin',
      banks: '/api/banks',
    },
    documentation: 'Contact support for API documentation',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banks', bankRoutes);

// Initialize Socket.IO
initializeSocketHandlers(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found', status: 404 } });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});

export { io };
