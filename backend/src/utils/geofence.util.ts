/**
 * Geofence validation utilities
 * Validates driver location against pickup/dropoff points
 */

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in meters
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if driver is within acceptable radius of target location
 * @param driverLocation Current driver coordinates
 * @param targetLocation Target coordinates (pickup/dropoff)
 * @param radiusMeters Acceptable radius in meters (default 100m)
 * @returns true if within radius
 */
export function isWithinGeofence(
  driverLocation: Coordinates,
  targetLocation: Coordinates,
  radiusMeters: number = 100
): boolean {
  const distance = calculateDistance(driverLocation, targetLocation);
  return distance <= radiusMeters;
}

/**
 * Validate location coordinates
 * @returns true if valid coordinates
 */
export function isValidCoordinates(coord: Coordinates): boolean {
  return (
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  );
}

/**
 * Check if coordinates are within Nigeria bounds (service area)
 * Nigeria bounds: lat 4°N to 14°N, long 3°E to 15°E
 */
export function isWithinNigeria(coord: Coordinates): boolean {
  return (
    coord.latitude >= 4 &&
    coord.latitude <= 14 &&
    coord.longitude >= 3 &&
    coord.longitude <= 15
  );
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
