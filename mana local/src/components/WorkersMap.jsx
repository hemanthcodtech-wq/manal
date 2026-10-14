import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HiStar, HiLocationMarker } from 'react-icons/hi';
import './WorkersMap.css';

// Public token fallback for development/demo (users can supply VITE_MAPBOX_TOKEN in .env)
const DEFAULT_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFuYWxvY2FsIiwiYSI6ImNsbjB4bTJ0YjAzNDcya3Bha216dWxxeXQifQ.demo';

export default function WorkersMap({
  workers = [],
  hoveredWorkerId = null,
  onSelectWorker = () => {},
  userLocation = null
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
    if (!token) {
      setTokenMissing(true);
    }
    mapboxgl.accessToken = token;

    // Default center: User location or Hyderabad / Central coords
    const initialLng = userLocation?.lng || 78.4867;
    const initialLat = userLocation?.lat || 17.3850;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: 12,
      attributionControl: false
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    // Add user location pulsing marker if available
    if (userLocation?.lat && userLocation?.lng) {
      const userDot = document.createElement('div');
      userDot.className = 'user-pulse-marker';
      userDot.innerHTML = '<div class="user-pulse-ring"></div><div class="user-pulse-dot"></div>';
      new mapboxgl.Marker({ element: userDot })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setText('You are here'))
        .addTo(map);
    }

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [userLocation]);

  // Update worker markers whenever workers list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const bounds = new mapboxgl.LngLatBounds();
    let hasCoords = false;

    // Fallback coordinates generator for workers missing lat/lng (distributed around center)
    const baseLng = userLocation?.lng || 78.4867;
    const baseLat = userLocation?.lat || 17.3850;

    workers.forEach((worker, index) => {
      // Use real worker coordinates or create realistic offset around center
      const angle = (index * (360 / Math.max(workers.length, 1))) * (Math.PI / 180);
      const distanceOffset = 0.015 + ((index % 3) * 0.008); // ~1.5km - 3km
      const lng = worker.longitude ? parseFloat(worker.longitude) : baseLng + Math.cos(angle) * distanceOffset;
      const lat = worker.latitude ? parseFloat(worker.latitude) : baseLat + Math.sin(angle) * distanceOffset;

      if (!isNaN(lng) && !isNaN(lat)) {
        bounds.extend([lng, lat]);
        hasCoords = true;

        // Custom HTML marker
        const el = document.createElement('div');
        el.className = `worker-map-marker ${hoveredWorkerId === worker.id ? 'is-hovered' : ''}`;
        el.id = `worker-marker-${worker.id}`;
        const formattedRate = worker.hasCustomRate ? `₹${worker.rate}` : 'Verified';
        el.innerHTML = `
          <div class="marker-pill">
            <img src="${worker.image}" alt="${worker.name}" class="marker-avatar" />
            <span class="marker-price">${formattedRate}</span>
          </div>
          <div class="marker-pin-point"></div>
        `;

        el.addEventListener('click', () => {
          onSelectWorker(worker);
        });

        // Popup with rich info
        const popupContent = document.createElement('div');
        popupContent.className = 'map-worker-popup';
        popupContent.innerHTML = `
          <div class="mwp-header">
            <img src="${worker.image}" class="mwp-avatar" />
            <div>
              <div class="mwp-name">${worker.name}</div>
              <div class="mwp-rating">★ ${worker.rating} • ${worker.jobsCompleted || 0} jobs</div>
            </div>
          </div>
          <div class="mwp-footer">
            <span class="mwp-rate">${formattedRate}</span>
            <button class="mwp-action-btn">View Profile</button>
          </div>
        `;
        popupContent.querySelector('.mwp-action-btn')?.addEventListener('click', () => {
          onSelectWorker(worker);
        });

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setDOMContent(popupContent);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current[worker.id] = marker;
      }
    });

    if (hasCoords && workers.length > 0) {
      if (userLocation?.lat && userLocation?.lng) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });
    }
  }, [workers, userLocation]);

  // Highlight marker when card is hovered
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (parseInt(id) === hoveredWorkerId || id === hoveredWorkerId) {
        el.classList.add('is-hovered');
        marker.togglePopup();
      } else {
        el.classList.remove('is-hovered');
      }
    });
  }, [hoveredWorkerId]);

  return (
    <div className="workers-map-wrapper">
      {tokenMissing && (
        <div className="mapbox-token-hint">
          <span>💡 <strong>Tip:</strong> Add <code>VITE_MAPBOX_TOKEN=pk.xxx</code> to <code>.env</code> for full Mapbox access.</span>
        </div>
      )}
      <div ref={mapContainerRef} className="workers-map-container" />
    </div>
  );
}
