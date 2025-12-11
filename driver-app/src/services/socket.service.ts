import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://tech-ride.onrender.com';

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => console.log('✅ Driver Socket connected'));
    this.socket.on('disconnect', () => console.log('❌ Driver Socket disconnected'));
    this.socket.on('connect_error', (error) => console.error('Driver Socket error:', error));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Driver-specific events
  onRideRequest(callback: (data: any) => void) {
    this.socket?.on('ride-request', callback);
  }

  acceptRide(rideId: string) {
    this.socket?.emit('accept-ride', rideId);
  }

  rejectRide(rideId: string, reason: string) {
    this.socket?.emit('reject-ride', { rideId, reason });
  }

  startRide(rideId: string) {
    this.socket?.emit('start-ride', rideId);
  }

  completeRide(rideId: string) {
    this.socket?.emit('complete-ride', rideId);
  }

  // Location updates
  updateLocation(latitude: number, longitude: number) {
    this.socket?.emit('update-location', { latitude, longitude });
  }

  // Driver status
  setOnline() {
    this.socket?.emit('driver-online');
  }

  setOffline() {
    this.socket?.emit('driver-offline');
  }

  // Messages
  sendMessage(rideId: string, message: string, recipientId: string) {
    this.socket?.emit('send-message', { rideId, message, recipientId });
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new-message', callback);
  }

  // Remove listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export default new SocketService();
