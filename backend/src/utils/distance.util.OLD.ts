import { VehicleType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate fare based on distance, duration, and vehicle type
export async function calculateFareAmount(
  distance: number,
  duration: number,
  vehicleType: VehicleType
): Promise<{ baseFare: number; distanceFare: number; timeFare: number; surgeMultiplier: number; totalFare: number }> {
  const baseFare = parseFloat(process.env.BASE_FARE || '2.50');
  const costPerKm = parseFloat(process.env.COST_PER_KM || '1.20');
  const costPerMinute = parseFloat(process.env.COST_PER_MINUTE || '0.30');

  // Vehicle type multipliers
  const vehicleMultipliers = {
    ECONOMY: 1.0,
    COMFORT: 1.3,
    XL: 1.6,
    BIKE: 0.7,
  };

  const vehicleMultiplier = vehicleMultipliers[vehicleType];

  const distanceFare = distance * costPerKm * vehicleMultiplier;
  const timeFare = duration * costPerMinute * vehicleMultiplier;

  // Check for surge pricing (simplified - in production, check demand/supply)
  let surgeMultiplier = 1.0;
  
  // Example: Check if there's an active surge zone
  // const surgeZones = await prisma.surgeZone.findMany({ where: { isActive: true } });
  // Logic to determine surge multiplier based on pickup location

  const subtotal = baseFare + distanceFare + timeFare;
  const totalFare = subtotal * surgeMultiplier;

  return {
    baseFare,
    distanceFare,
    timeFare,
    surgeMultiplier,
    totalFare: Math.round(totalFare * 100) / 100,
  };
}
