// Socket.io removed due to SDK 54 compatibility issues
// Using REST API polling instead
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = __DEV__ ? 'http://localhost:5000' : 'https://api.techride.ng';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  async connect() {
    const token = await AsyncStorage.getItem('authToken');
    
    if (!token) {
      console.log('❌ No auth token found');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Setup event listeners
    this.setupListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    // New ride request
    this.socket.on('new-ride-request', (data) => {
      this.emit('new-ride-request', data);
    });

    // Ride cancelled by rider
    this.socket.on('ride-cancelled', (data) => {
      this.emit('ride-cancelled', data);
    });

    // Message from rider
    this.socket.on('new-message', (data) => {
      this.emit('new-message', data);
    });

    // Emergency SOS
    this.socket.on('emergency-alert', (data) => {
      this.emit('emergency-alert', data);
    });
  }

  // Emit event to backend
  send(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Update driver location
  updateLocation(latitude: number, longitude: number, heading?: number) {
    this.send('update-location', { latitude, longitude, heading });
  }

  // Update driver status
  updateStatus(isOnline: boolean, isAvailable?: boolean) {
    this.send('update-status', { isOnline, isAvailable });
  }

  // Driver arrived at pickup
  driverArrived(rideId: string) {
    this.send('driver-arrived', rideId);
  }

  // Accept ride (via socket)
  acceptRide(rideId: string) {
    this.send('accept-ride', rideId);
  }

  // Send message to rider
  sendMessage(rideId: string, message: string, recipientId: string) {
    this.send('send-message', { rideId, message, recipientId });
  }

  // Emergency SOS
  sendSOS(rideId: string, location: { lat: number; lng: number }) {
    this.send('emergency-sos', { rideId, location });
  }

  // Listen to events
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Remove listener
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit to internal listeners
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export default new SocketService();
