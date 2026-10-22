import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HiLocationMarker, HiPhone, HiBadgeCheck, HiInformationCircle } from 'react-icons/hi';
import './CustomerWorkerRouteMap.css';

export default function CustomerWorkerRouteMap({
  customerCoords,
  workerCoords,
  customerLocationName = 'Your Location',
  workerLocationName = 'Worker Location',
  workerName = 'Specialist',
  distanceKm = null
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !mapContainerRef.current) {
      setMapError(true);
      return;
    }
    mapboxgl.accessToken = token;

    const cLng = customerCoords?.lng || 78.4867;
    const cLat = customerCoords?.lat || 17.3850;
    const wLng = workerCoords?.lng || 78.4900;
    const wLat = workerCoords?.lat || 17.3900;

    let map;
    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1', // Luxury dark map style
        center: [(cLng + wLng) / 2, (cLat + wLat) / 2],
        zoom: 11,
        attributionControl: false
      });
      mapRef.current = map;
    } catch (e) {
      console.warn('Map initialization failed:', e);
      setMapError(true);
      return;
    }

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', async () => {
      // 1. Add Customer Marker (Teal Pulse)
      const customerEl = document.createElement('div');
      customerEl.className = 'route-map-pin customer-pin';
      customerEl.innerHTML = `
        <div class="pin-radar"></div>
        <div class="pin-center customer-center">
          <span class="pin-icon">📍</span>
        </div>
        <div class="pin-tooltip">Customer (You)</div>
      `;
      new mapboxgl.Marker({ element: customerEl })
        .setLngLat([cLng, cLat])
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`<strong>Customer Location</strong><br/>${customerLocationName}`))
        .addTo(map);

      // 2. Add Worker Marker (Golden Glow)
      const workerEl = document.createElement('div');
      workerEl.className = 'route-map-pin worker-pin';
      workerEl.innerHTML = `
        <div class="pin-radar worker-radar"></div>
        <div class="pin-center worker-center">
          <span class="pin-icon">👷</span>
        </div>
        <div class="pin-tooltip">${workerName}</div>
      `;
      new mapboxgl.Marker({ element: workerEl })
        .setLngLat([wLng, wLat])
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`<strong>${workerName}</strong><br/>${workerLocationName}`))
        .addTo(map);

      // 3. Request Mapbox Directions API for driving route
      try {
        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${cLng},${cLat};${wLng},${wLat}?geometries=geojson&overview=full&access_token=${token}`;
        const res = await fetch(directionsUrl);
        const data = await res.json();

        let routeGeoJSON;
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          routeGeoJSON = route.geometry;
          const durationMins = Math.round(route.duration / 60);
          const routeDistanceKm = (route.distance / 1000).toFixed(1);
          setRouteInfo({
            distance: `${routeDistanceKm} km`,
            duration: durationMins > 60 ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m` : `${durationMins} mins`,
            type: 'Driving Route'
          });
        } else {
          // Direct straight-line fallback
          routeGeoJSON = {
            type: 'LineString',
            coordinates: [[cLng, cLat], [wLng, wLat]]
          };
          setRouteInfo({
            distance: distanceKm ? `${distanceKm.toFixed(1)} km` : 'Direct Path',
            duration: 'Direct Distance',
            type: 'Straight Line'
          });
        }

        // Add Route Glowing Background Layer
        map.addSource('route-line', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeGeoJSON
          }
        });

        // Outer glow line
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route-line',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#0ea5e9',
            'line-width': 8,
            'line-opacity': 0.4,
            'line-blur': 3
          }
        });

        // Inner solid line
        map.addLayer({
          id: 'route-path',
          type: 'line',
          source: 'route-line',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#38bdf8',
            'line-width': 4,
            'line-opacity': 0.95,
            'line-dasharray': [1, 0]
          }
        });

      } catch (err) {
        console.warn('Could not load driving route line, rendering straight line:', err);
      }

      // 4. Fit bounds to contain both points smoothly
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([cLng, cLat]);
      bounds.extend([wLng, wLat]);
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 13,
        duration: 1200
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [customerCoords, workerCoords, customerLocationName, workerLocationName, workerName, distanceKm]);

  return (
    <div className="crm-wrapper">
      <div className="crm-header-hud">
        <div className="crm-hud-badge">
          <span className="crm-pulse-dot"></span> Live Spatial GPS
        </div>
        {routeInfo && (
          <div className="crm-route-meta">
            <span className="crm-meta-val">⚡ {routeInfo.distance}</span>
            <span className="crm-meta-div">•</span>
            <span className="crm-meta-val">⏱ {routeInfo.duration}</span>
          </div>
        )}
      </div>

      {mapError && (
        <div className="crm-fallback-box">
          <HiInformationCircle size={24} />
          <div>
            <strong>Interactive Map Unavailable</strong>
            <p>Direct distance calculated: {distanceKm ? `${distanceKm.toFixed(1)} km` : 'Approx. 5 km'}</p>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="crm-map-canvas" />

      {/* Floating Customer to Worker Journey Bar */}
      <div className="crm-journey-card">
        <div className="crm-journey-node">
          <div className="node-icon node-customer">📍</div>
          <div className="node-info">
            <span className="node-label">Customer</span>
            <span className="node-text">{customerLocationName || 'You (Nearby)'}</span>
          </div>
        </div>

        <div className="crm-journey-path">
          <div className="journey-line"></div>
          <span className="journey-badge">{distanceKm ? `${distanceKm.toFixed(1)} km` : 'Direct'}</span>
        </div>

        <div className="crm-journey-node">
          <div className="node-icon node-worker">👷</div>
          <div className="node-info">
            <span className="node-label">{workerName}</span>
            <span className="node-text">{workerLocationName || 'Local Specialist'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
