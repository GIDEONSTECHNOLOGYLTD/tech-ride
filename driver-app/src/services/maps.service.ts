import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY'; // Replace with actual key or env variable

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface DirectionsResult {
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string;
  steps: any[];
}

export const getDirections = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<DirectionsResult | null> => {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          key: GOOGLE_MAPS_API_KEY,
          mode: 'driving',
          alternatives: false,
        },
      }
    );

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.value,
        duration: leg.duration.value,
        polyline: route.overview_polyline.points,
        steps: leg.steps,
      };
    }

    return null;
  } catch (error) {
    console.error('Get directions error:', error);
    return null;
  }
};

export const decodePolyline = (encoded: string): Coordinates[] => {
  const points: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
};

export const calculateBearing = (
  start: Coordinates,
  end: Coordinates
): number => {
  const startLat = (start.latitude * Math.PI) / 180;
  const startLng = (start.longitude * Math.PI) / 180;
  const endLat = (end.latitude * Math.PI) / 180;
  const endLng = (end.longitude * Math.PI) / 180;

  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  const bearing = Math.atan2(y, x);
  return ((bearing * 180) / Math.PI + 360) % 360;
};

export const openGoogleMaps = (
  latitude: number,
  longitude: number,
  label?: string
) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}${
    label ? `&destination_place_id=${label}` : ''
  }`;
  return url;
};
