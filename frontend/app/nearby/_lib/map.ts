/**
 * Phase 3: Nearby/Onsite Commerce - Mapbox Integration
 * Map configuration and utilities for location-based features
 */

import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

// Initialize Mapbox with token from environment
const mapboxToken = Constants.expoConfig?.extra?.MAPBOX_PUBLIC_TOKEN || 
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN || 
  'pk.eyJ1IjoiYWlzbGVtYXJ0cyIsImEiOiJjbTU4dGJucjIwZTN6MmpxdGtjeXQ4dW56In0.demo_token_for_development';

if (mapboxToken) {
  Mapbox.setAccessToken(mapboxToken);
  Mapbox.setConnected(true);
}

export { Mapbox };

// Default Nairobi coordinates
export const NAIROBI_CENTER: [number, number] = [36.8065, -1.2685];

// Location permission helper
export const requestLocationPermission = async (): Promise<{
  granted: boolean;
  location?: Location.LocationObject;
  error?: string;
}> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return {
        granted: false,
        error: 'Location permission denied. Please enable location access in settings.'
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    return {
      granted: true,
      location
    };
  } catch (error) {
    console.error('Location permission error:', error);
    return {
      granted: false,
      error: 'Failed to get location. Please try again.'
    };
  }
};

// Distance calculation utility
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Return distance in meters
};

// Format distance for display
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};

// Map style configurations
export const MAP_STYLES = {
  street: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11'
};

// Default map configuration
export const DEFAULT_MAP_CONFIG = {
  zoomLevel: 13,
  pitch: 0,
  heading: 0,
  style: MAP_STYLES.street
};