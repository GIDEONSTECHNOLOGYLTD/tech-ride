import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function initializeSocketHandlers(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      (socket as any).userId = decoded.userId;
      (socket as any).role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const role = (socket as any).role;

    console.log(`User connected: ${userId} (${role})`);

    // Join user-specific room
    socket.join(`user-${userId}`);
    if (role === 'DRIVER') {
      socket.join(`driver-${userId}`);
    }

    // Driver location update
    socket.on('update-location', async (data: { latitude: number; longitude: number }) => {
      if (role === 'DRIVER') {
        try {
          await prisma.driver.update({
            where: { userId },
            data: {
              currentLatitude: data.latitude,
              currentLongitude: data.longitude,
            },
          });

          // Broadcast location to riders tracking this driver
          // (you'd need to track active rides and notify riders)
        } catch (error) {
          console.error('Update location error:', error);
        }
      }
    });

    // Driver status update
    socket.on('update-status', async (data: { isOnline: boolean; isAvailable: boolean }) => {
      if (role === 'DRIVER') {
        try {
          await prisma.driver.update({
            where: { userId },
            data: {
              isOnline: data.isOnline,
              isAvailable: data.isAvailable,
            },
          });
        } catch (error) {
          console.error('Update status error:', error);
        }
      }
    });

    // Driver arrived at pickup
    socket.on('driver-arrived', async (rideId: string) => {
      try {
        const ride = await prisma.ride.update({
          where: { id: rideId },
          data: { status: 'ARRIVED', arrivedAt: new Date() },
        });
        io.to(`user-${ride.riderId}`).emit('driver-arrived', { rideId });
      } catch (error) {
        console.error('Driver arrived error:', error);
      }
    });

    // Send message
    socket.on('send-message', (data: { rideId: string; message: string; recipientId: string }) => {
      io.to(`user-${data.recipientId}`).emit('new-message', {
        rideId: data.rideId,
        message: data.message,
        senderId: userId,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
}
