import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { rideAPI } from '../services/api';
import socketService from '../services/socket';

interface Ride {
  id: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance: number;
  vehicleType: string;
  rider: {
    name: string;
    phone: string;
    rating: number;
  };
  status: string;
}

interface RideContextType {
  currentRide: Ride | null;
  pendingRides: Ride[];
  acceptRide: (rideId: string) => Promise<void>;
  startRide: () => Promise<void>;
  completeRide: (actualDistance?: number, actualDuration?: number) => Promise<void>;
  cancelRide: (reason: string) => Promise<void>;
}

const RideContext = createContext<RideContextType>({} as RideContextType);

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [pendingRides, setPendingRides] = useState<Ride[]>([]);

  useEffect(() => {
    // Listen for new ride requests
    socketService.on('new-ride-request', handleNewRideRequest);
    socketService.on('ride-cancelled', handleRideCancelled);

    return () => {
      socketService.off('new-ride-request', handleNewRideRequest);
      socketService.off('ride-cancelled', handleRideCancelled);
    };
  }, []);

  const handleNewRideRequest = (data: any) => {
    // Show alert
    Alert.alert(
      '🚗 New Ride Request!',
      `Pickup: ${data.pickup}\nDropoff: ${data.dropoff}\nFare: ₦${data.fare}\nDistance: ${data.distance.toFixed(1)}km`,
      [
        { text: 'Ignore', style: 'cancel' },
        { text: 'Accept', onPress: () => acceptRide(data.rideId) },
      ]
    );

    // Add to pending rides
    setPendingRides((prev) => [...prev, data]);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      setPendingRides((prev) => prev.filter((r) => r.id !== data.rideId));
    }, 30000);
  };

  const handleRideCancelled = (data: any) => {
    if (currentRide?.id === data.rideId) {
      Alert.alert('Ride Cancelled', 'The rider has cancelled this ride');
      setCurrentRide(null);
    }
    setPendingRides((prev) => prev.filter((r) => r.id !== data.rideId));
  };

  const acceptRide = async (rideId: string) => {
    try {
      const response = await rideAPI.acceptRide(rideId);
      const rideData = response.data.ride;

      // Get full ride details
      const detailsResponse = await rideAPI.getRideDetails(rideId);
      setCurrentRide(detailsResponse.data.ride);

      // Remove from pending
      setPendingRides((prev) => prev.filter((r) => r.id !== rideId));

      // Notify via socket
      socketService.acceptRide(rideId);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept ride');
    }
  };

  const startRide = async () => {
    if (!currentRide) return;

    try {
      await rideAPI.startRide(currentRide.id);
      setCurrentRide({ ...currentRide, status: 'IN_PROGRESS' });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to start ride');
    }
  };

  const completeRide = async (actualDistance?: number, actualDuration?: number) => {
    if (!currentRide) return;

    try {
      await rideAPI.completeRide(currentRide.id, { actualDistance, actualDuration });
      Alert.alert('Success', 'Ride completed successfully!');
      setCurrentRide(null);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to complete ride');
    }
  };

  const cancelRide = async (reason: string) => {
    if (!currentRide) return;

    try {
      await rideAPI.cancelRide(currentRide.id, reason);
      setCurrentRide(null);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to cancel ride');
    }
  };

  return (
    <RideContext.Provider
      value={{
        currentRide,
        pendingRides,
        acceptRide,
        startRide,
        completeRide,
        cancelRide,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);
