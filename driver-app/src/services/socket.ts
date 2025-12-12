import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://tech-ride.onrender.com';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  async connect() {
    const token = await AsyncStorage.getItem('authToken');
    
    if (!token) {
      console.log('❌ No auth token found');
      return;
    }

    if (this.socket?.connected) {
      console.log('✅ Already connected');
      return;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.setupListeners();
      console.log('✅ Driver socket initialized');
    } catch (error) {
      console.error('❌ Socket connection error:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('❌ Driver disconnected');
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Driver connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });
  }

  // Update driver location
  updateLocation(latitude: number, longitude: number, heading?: number) {
    if (this.socket?.connected) {
      this.socket.emit('update-location', { latitude, longitude, heading });
    }
  }

  // Update driver status
  updateStatus(isOnline: boolean, isAvailable?: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('update-status', { isOnline, isAvailable });
    }
  }

  // Driver arrived at pickup
  driverArrived(rideId: string) {
    if (this.socket?.connected) {
      this.socket.emit('driver-arrived', rideId);
    }
  }

  // Accept ride
  acceptRide(rideId: string) {
    if (this.socket?.connected) {
      this.socket.emit('accept-ride', rideId);
    }
  }

  // Send message to rider
  sendMessage(rideId: string, message: string, recipientId: string) {
    if (this.socket?.connected) {
      this.socket.emit('send-message', { rideId, message, recipientId });
    }
  }

  // Emergency SOS
  sendSOS(rideId: string, location: { lat: number; lng: number }) {
    if (this.socket?.connected) {
      this.socket.emit('emergency-sos', { rideId, location });
    }
  }

  // Listen to events
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove listener
  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
