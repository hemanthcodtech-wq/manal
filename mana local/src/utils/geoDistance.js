// Utility for consistent distance calculation across all pages
export const EARTH_RADIUS_KM = 6371;

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const p1 = Number(lat1);
  const l1 = Number(lon1);
  const p2 = Number(lat2);
  const l2 = Number(lon2);
  if (isNaN(p1) || isNaN(l1) || isNaN(p2) || isNaN(l2)) return null;

  const dLat = (p2 - p1) * (Math.PI / 180);
  const dLon = (l2 - l1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1 * (Math.PI / 180)) * Math.cos(p2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function formatDistance(distanceInKm) {
  if (distanceInKm == null || isNaN(distanceInKm)) return 'Nearby';
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
}

// Consistent worker coordinate resolver
export function getWorkerCoordinates(worker, userLocation) {
  const uLat = userLocation?.lat || 17.3850;
  const uLng = userLocation?.lng || 78.4867;

  let lat = worker.latitude ? parseFloat(worker.latitude) : null;
  let lng = worker.longitude ? parseFloat(worker.longitude) : null;

  // If worker hasn't set custom GPS pin, generate deterministic offset based on worker id
  if (!lat || !lng) {
    const idNum = Number(worker.id) || 1;
    const deterministicDistanceKm = 0.8 + ((idNum % 7) * 0.4); // 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2
    const deterministicAngle = (idNum * 53) * (Math.PI / 180);

    const dLat = (deterministicDistanceKm / 111);
    const dLng = (deterministicDistanceKm / (111 * Math.cos(uLat * Math.PI / 180)));
    lat = parseFloat((uLat + Math.sin(deterministicAngle) * dLat).toFixed(6));
    lng = parseFloat((uLng + Math.cos(deterministicAngle) * dLng).toFixed(6));
  }

  return { lat, lng };
}

// Global cached user location to share across Home and Workers pages instantly
let cachedCustomerLocation = null;

export function getCustomerLocation(callback) {
  if (cachedCustomerLocation) {
    callback(cachedCustomerLocation);
    return;
  }

  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        cachedCustomerLocation = loc;
        callback(loc);
      },
      () => {
        const fallback = { lat: 17.3850, lng: 78.4867 };
        cachedCustomerLocation = fallback;
        callback(fallback);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  } else {
    const fallback = { lat: 17.3850, lng: 78.4867 };
    cachedCustomerLocation = fallback;
    callback(fallback);
  }
}
