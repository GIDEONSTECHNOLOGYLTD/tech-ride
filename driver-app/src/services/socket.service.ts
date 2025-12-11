// Socket.io removed due to SDK 54 compatibility issues
// Using REST API polling instead
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://tech-ride.onrender.com';

class SocketService {
  private connected: boolean = false;

  async connect() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;
    
    this.connected = true;
    console.log('✅ Driver Service connected (polling mode)');
  }

  disconnect() {
    this.connected = false;
    console.log('❌ Driver Service disconnected');
  }

  // Driver-specific events (stubs for polling mode)
  onRideRequest(callback: (data: any) => void) {
    // Use polling instead
    console.log('Use polling for ride requests');
  }

  acceptRide(rideId: string) {
    console.log('Accept ride via API:', rideId);
  }

  rejectRide(rideId: string, reason: string) {
    console.log('Reject ride via API:', rideId);
  }

  startRide(rideId: string) {
    console.log('Start ride via API:', rideId);
  }

  completeRide(rideId: string) {
    console.log('Complete ride via API:', rideId);
  }

  // Location updates
  updateLocation(latitude: number, longitude: number) {
    console.log('Update location via API:', latitude, longitude);
  }

  // Driver status
  setOnline() {
    console.log('Set driver online via API');
  }

  setOffline() {
    console.log('Set driver offline via API');
  }

  // Messages
  sendMessage(rideId: string, message: string, recipientId: string) {
    console.log('Send message via API');
  }

  onNewMessage(callback: (data: any) => void) {
    console.log('Use polling for messages');
  }

  // Remove listeners
  removeAllListeners() {
    console.log('No listeners to remove (polling mode)');
  }
}

export default new SocketService();
