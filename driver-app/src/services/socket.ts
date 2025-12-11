// Socket.io removed due to SDK 54 compatibility issues
// Using REST API polling instead
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://tech-ride.onrender.com';

class SocketService {
  private connected: boolean = false;
  private listeners: Map<string, Function[]> = new Map();

  async connect() {
    const token = await AsyncStorage.getItem('authToken');
    
    if (!token) {
      console.log('❌ No auth token found');
      return;
    }

    this.connected = true;
    console.log('✅ Driver connected (polling mode)');
  }

  disconnect() {
    this.connected = false;
    console.log('❌ Driver disconnected');
  }

  private setupListeners() {
    // No socket listeners in polling mode
  }

  // Emit event to backend
  send(event: string, data?: any) {
    console.log('Send via API:', event, data);
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
