import Driver from '../models/Driver';
import User from '../models/User';
import { calculateDistance } from './distance.util';

export async function findNearbyDrivers(
  latitude: number,
  longitude: number,
  vehicleType: string,
  radiusKm: number = 5
) {
  try {
    // Use MongoDB geospatial query to find nearby drivers
    const nearbyDrivers = await Driver.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusKm * 1000, // Convert km to meters
        },
      },
      vehicleType,
      isOnline: true,
      isAvailable: true,
      isApproved: true,
    })
      .limit(20)
      .populate('userId', 'firstName lastName phoneNumber rating profilePhoto');

    return nearbyDrivers;
  } catch (error) {
    console.error('Error finding nearby drivers:', error);
    return [];
  }
}

export async function getDriverStats(driverId: string) {
  const driver = await Driver.findById(driverId);
  if (!driver) {
    return null;
  }

  return {
    rating: driver.rating,
    totalRides: driver.totalRides,
    completedRides: driver.completedRides,
    cancelledRides: driver.cancelledRides,
    acceptanceRate: driver.acceptanceRate,
    totalEarnings: driver.totalEarnings,
  };
}

export async function updateDriverLocation(
  userId: string,
  latitude: number,
  longitude: number,
  heading?: number
) {
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new Error('Driver not found');
  }

  driver.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  
  if (heading !== undefined) {
    driver.heading = heading;
  }

  driver.lastOnline = new Date();
  await driver.save();

  return driver;
}
