import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HiLocationMarker, HiCheckCircle } from 'react-icons/hi';
import './LocationPicker.css';

export default function LocationPicker({
  value = { address: '', latitude: null, longitude: null },
  onChange = () => {}
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [detecting, setDetecting] = useState(false);
  const [coords, setCoords] = useState({
    lat: value.latitude || 17.3850,
    lng: value.longitude || 78.4867
  });
  const [isFixed, setIsFixed] = useState(!!value.latitude);

  // Reverse geocode lat/lng to readable address
  const fetchAddressFromCoords = async (lng, lat) => {
    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (token) {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=poi,address,neighborhood,locality,place`);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const place = data.features[0].place_name;
          return place;
        }
      }
      // Fallback via OpenStreetMap nominatim if Mapbox token is not set
      const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const osmData = await osmRes.json();
      if (osmData.display_name) {
        return osmData.display_name.split(',').slice(0, 3).join(',');
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  // Initialize Mapbox
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
    if (!token || !mapContainerRef.current) return;
    mapboxgl.accessToken = token;

    let map;
    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [coords.lng, coords.lat],
        zoom: isFixed ? 14 : 11,
        attributionControl: false
      });
    } catch (e) {
      console.warn('Mapbox initialization failed:', e);
      return;
    }

    const marker = new mapboxgl.Marker({
      draggable: true,
      color: '#0284c7'
    })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map);

    // Draggable marker event
    marker.on('dragend', async () => {
      const lngLat = marker.getLngLat();
      setCoords({ lat: lngLat.lat, lng: lngLat.lng });
      setIsFixed(true);

      const addressName = await fetchAddressFromCoords(lngLat.lng, lngLat.lat);
      onChange({
        address: addressName,
        latitude: parseFloat(lngLat.lat.toFixed(6)),
        longitude: parseFloat(lngLat.lng.toFixed(6))
      });
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
    };
  }, []);

  // 1-Click Detect GPS Location
  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setCoords({ lat, lng });
        setIsFixed(true);

        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
          markerRef.current.setLngLat([lng, lat]);
        }

        const addressName = await fetchAddressFromCoords(lng, lat);
        setDetecting(false);

        onChange({
          address: addressName,
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6))
        });
      },
      (err) => {
        setDetecting(false);
        alert('Could not retrieve your location. Please check browser permissions or drag the pin on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="location-picker-container">
      <div className="loc-actions">
        <button
          type="button"
          className={`detect-gps-btn ${detecting ? 'loading' : ''}`}
          onClick={handleDetectLocation}
          disabled={detecting}
        >
          <HiLocationMarker className="loc-btn-icon" />
          <span>{detecting ? 'Locating...' : 'Auto-Detect Operating Location'}</span>
        </button>

        {isFixed && (
          <div className="loc-fixed-badge">
            <HiCheckCircle /> Fixed Base Point
          </div>
        )}
      </div>

      <div ref={mapContainerRef} className="mini-mapbox-preview" />

      <p className="loc-hint">
        💡 Drag the blue pin directly to your workshop, shop, or central operating location.
      </p>
    </div>
  );
}
