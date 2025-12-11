import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || 'https://tech-ride.onrender.com';

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => console.log('✅ Socket connected'));
    this.socket.on('disconnect', () => console.log('❌ Socket disconnected'));
    this.socket.on('connect_error', (error) => console.error('Socket error:', error));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Ride events
  onRideRequest(callback: (data: any) => void) {
    this.socket?.on('ride-request', callback);
  }

  onRideAccepted(callback: (data: any) => void) {
    this.socket?.on('ride-accepted', callback);
  }

  onRideCancelled(callback: (data: any) => void) {
    this.socket?.on('ride-cancelled', callback);
  }

  onDriverArrived(callback: (data: any) => void) {
    this.socket?.on('driver-arrived', callback);
  }

  onRideStarted(callback: (data: any) => void) {
    this.socket?.on('ride-started', callback);
  }

  onRideCompleted(callback: (data: any) => void) {
    this.socket?.on('ride-completed', callback);
  }

  // Driver location updates
  updateLocation(latitude: number, longitude: number) {
    this.socket?.emit('update-location', { latitude, longitude });
  }

  // Messages
  sendMessage(rideId: string, message: string, recipientId: string) {
    this.socket?.emit('send-message', { rideId, message, recipientId });
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new-message', callback);
  }
}

export default new SocketService();
