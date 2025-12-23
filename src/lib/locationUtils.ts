/**
 * Location utilities for GDPR-compliant coordinate handling
 * Implements data minimization by reducing GPS precision
 */

/**
 * Round coordinates to 2 decimal places (~1.1km precision)
 * This satisfies GDPR Article 5(1)(c) - Data Minimization
 * while still allowing for regional analytics
 */
export function roundCoordinates(lat: number | null, lng: number | null): { lat: number | null; lng: number | null } {
  return {
    lat: lat !== null ? Math.round(lat * 100) / 100 : null,
    lng: lng !== null ? Math.round(lng * 100) / 100 : null,
  };
}

/**
 * Check if location consent has been given
 */
export function hasLocationConsent(): boolean {
  return localStorage.getItem('location_consent') === 'true';
}

/**
 * Get approximate location string for display
 */
export function formatApproximateLocation(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) {
    return 'Location not available';
  }
  const rounded = roundCoordinates(lat, lng);
  return `~${rounded.lat}°, ${rounded.lng}° (approximate)`;
}

/**
 * Request location with consent check
 * Returns null if consent not given or location unavailable
 */
export async function getLocationWithConsent(): Promise<GeolocationPosition | null> {
  if (!hasLocationConsent()) {
    console.log('Location consent not given');
    return null;
  }

  if (!navigator.geolocation) {
    console.log('Geolocation not supported');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        console.log('Geolocation error:', error.message);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

/**
 * Get rounded coordinates with consent check
 */
export async function getRoundedLocationWithConsent(): Promise<{ lat: number | null; lng: number | null }> {
  const position = await getLocationWithConsent();
  if (!position) {
    return { lat: null, lng: null };
  }
  return roundCoordinates(position.coords.latitude, position.coords.longitude);
}
