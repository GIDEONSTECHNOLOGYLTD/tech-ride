import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Driver from '../models/Driver';
import Ride from '../models/Ride';
import User from '../models/User';

export function initializeSocketHandlers(io: Server) {
  // Socket authentication middleware
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

    // Join user-specific rooms
    socket.join(`user_${userId}`);
    if (role === 'DRIVER') {
      socket.join(`driver_${userId}`);
    }

    // Driver location update (every 5 seconds from driver app)
    socket.on('update-location', async (data: { latitude: number; longitude: number; heading?: number }) => {
      if (role === 'DRIVER') {
        try {
          const driver = await Driver.findOne({ userId });
          if (driver) {
            driver.currentLocation = {
              type: 'Point',
              coordinates: [data.longitude, data.latitude],
            };
            if (data.heading !== undefined) {
              driver.heading = data.heading;
            }
            driver.lastOnline = new Date();
            await driver.save();

            // If driver has active ride, broadcast location to rider
            if (driver.currentRideId) {
              const ride = await Ride.findById(driver.currentRideId);
              if (ride) {
                io.to(`user_${ride.riderId}`).emit('driver-location-update', {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  heading: data.heading,
                  rideId: ride._id,
                });
              }
            }
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to update location' });
        }
      }
    });

    // Driver status update (online/offline/available)
    socket.on('update-status', async (data: { isOnline: boolean; isAvailable?: boolean }) => {
      if (role === 'DRIVER') {
        try {
          const driver = await Driver.findOne({ userId });
          if (driver) {
            driver.isOnline = data.isOnline;
            if (data.isAvailable !== undefined) {
              driver.isAvailable = data.isAvailable;
            }
            if (data.isOnline) {
              driver.lastOnline = new Date();
            }
            await driver.save();
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to update status' });
        }
      }
    });

    // Driver arrived at pickup location
    socket.on('driver-arrived', async (rideId: string) => {
      try {
        const ride = await Ride.findById(rideId);
        if (ride && ride.status === 'ACCEPTED') {
          ride.status = 'ARRIVED';
          ride.arrivedAt = new Date();
          await ride.save();

          // Notify rider
          io.to(`user_${ride.riderId}`).emit('driver-arrived', {
            rideId: ride._id,
            arrivedAt: ride.arrivedAt,
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to update arrival status' });
      }
    });

    // Rider location update (optional - for driver to see rider waiting)
    socket.on('rider-location-update', async (data: { latitude: number; longitude: number }) => {
      if (role === 'RIDER') {
        try {
          const user = await User.findById(userId);
          if (user) {
            user.lastKnownLocation = {
              type: 'Point',
              coordinates: [data.longitude, data.latitude],
            };
            await user.save();
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to update location' });
        }
      }
    });

    // In-ride messaging
    socket.on('send-message', async (data: { rideId: string; message: string; recipientId: string }) => {
      try {
        io.to(`user_${data.recipientId}`).emit('new-message', {
          rideId: data.rideId,
          message: data.message,
          senderId: userId,
          timestamp: new Date(),
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Driver accepts ride (additional socket notification)
    socket.on('accept-ride', async (rideId: string) => {
      if (role === 'DRIVER') {
        try {
          const ride = await Ride.findById(rideId);
          if (ride && ride.status === 'PENDING') {
            const driver = await Driver.findOne({ userId });
            if (driver) {
              ride.driverId = driver._id;
              ride.status = 'ACCEPTED';
              ride.acceptedAt = new Date();
              await ride.save();

              driver.isAvailable = false;
              driver.currentRideId = ride._id;
              await driver.save();

              // Notify rider
              const driverUser = await User.findById(driver.userId);
              io.to(`user_${ride.riderId}`).emit('ride-accepted', {
                rideId: ride._id,
                driver: {
                  id: driver._id,
                  name: driverUser?.firstName,
                  rating: driver.rating,
                  vehicleModel: driver.vehicleModel,
                  vehicleColor: driver.vehicleColor,
                  licensePlate: driver.licensePlate,
                  phone: driverUser?.phoneNumber,
                },
              });
            }
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to accept ride' });
        }
      }
    });

    // Typing indicator
    socket.on('typing', (data: { rideId: string; recipientId: string }) => {
      io.to(`user_${data.recipientId}`).emit('user-typing', {
        rideId: data.rideId,
        userId,
      });
    });

    // Request location sharing
    socket.on('request-location', (recipientId: string) => {
      io.to(`user_${recipientId}`).emit('location-requested', {
        requesterId: userId,
      });
    });

    // Emergency SOS
    socket.on('emergency-sos', async (data: { rideId: string; location: { lat: number; lng: number } }) => {
      try {
        const ride = await Ride.findById(data.rideId);
        if (ride) {
          // Notify both parties and admin
          io.to(`user_${ride.riderId}`).emit('emergency-alert', {
            rideId: data.rideId,
            location: data.location,
            userId,
          });

          if (ride.driverId) {
            const driver = await Driver.findById(ride.driverId);
            if (driver) {
              io.to(`user_${driver.userId}`).emit('emergency-alert', {
                rideId: data.rideId,
                location: data.location,
                userId,
              });
            }
          }

          // Notify admins (you'd need an admin room)
          io.to('admin-room').emit('emergency-alert', {
            rideId: data.rideId,
            location: data.location,
            userId,
            timestamp: new Date(),
          });

        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      // Update driver status to offline if it's a driver
      if (role === 'DRIVER') {
        Driver.findOne({ userId }).then((driver) => {
          if (driver) {
            driver.isOnline = false;
            driver.save();
          }
        });
      }
    });
  });
}
