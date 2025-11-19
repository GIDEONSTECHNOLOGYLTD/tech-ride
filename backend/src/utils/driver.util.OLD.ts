import { PrismaClient, VehicleType } from '@prisma/client';
import { calculateDistance } from './distance.util';

const prisma = new PrismaClient();

export async function findNearbyDrivers(
  latitude: number,
  longitude: number,
  vehicleType: VehicleType,
  radiusKm: number = 5
) {
  // Get all online and available drivers with the requested vehicle type
  const drivers = await prisma.driver.findMany({
    where: {
      isOnline: true,
      isAvailable: true,
      isApproved: true,
      vehicleType,
      currentLatitude: { not: null },
      currentLongitude: { not: null },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rating: true,
          profileImage: true,
        },
      },
    },
  });

  // Filter drivers within radius
  const nearbyDrivers = drivers.filter((driver) => {
    if (!driver.currentLatitude || !driver.currentLongitude) return false;
    const distance = calculateDistance(
      latitude,
      longitude,
      driver.currentLatitude,
      driver.currentLongitude
    );
    return distance <= radiusKm;
  });

  // Sort by distance
  return nearbyDrivers.sort((a, b) => {
    const distA = calculateDistance(latitude, longitude, a.currentLatitude!, a.currentLongitude!);
    const distB = calculateDistance(latitude, longitude, b.currentLatitude!, b.currentLongitude!);
    return distA - distB;
  });
}
