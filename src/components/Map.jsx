import { useEffect, useRef } from 'preact/hooks';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { tileLayerOffline, savetiles } from 'leaflet.offline';
import { CATEGORIES } from '../constants';

const Map = ({ pins, onPinClick, onMapReady }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userLocationRef = useRef(null);
  const pinMarkersRef = useRef({});

  // Create custom icon for pins
  const createPinIcon = (pin) => {
    const isNeed = pin.type === 'need';
    const categoryInfo = CATEGORIES[pin.category] || {};
    const bgColor = isNeed ? '#f97316' : '#06b6d4'; // orange-500 : cyan-500
    const iconSvg = getCategoryIconSvg(pin.category);
    const pulseClass = isNeed ? 'animate-pulse' : '';
    
    return L.divIcon({
      className: 'custom-pin-marker',
      html: `<div class="${pulseClass}" style="width: 40px; height: 40px; background-color: ${bgColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        ${iconSvg}
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  const getCategoryIconSvg = (category) => {
    // Simple SVG icons for each category
    const icons = {
      'Agua': '<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
      'Comida': '<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>',
      'Medicina': '<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>',
      'Refugio': '<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
      'Herramientas': '<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
      'Voluntarios': '<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>'
    };
    return icons[category] || icons['Agua'];
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Initialize map with default location
      const map = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
      mapRef.current = map;

      const offlineLayer = tileLayerOffline('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        minZoom: 13,
        maxZoom: 19,
      });

      const offlineControl = savetiles(offlineLayer, {
        saveText: '<span class="fa fa-download" aria-hidden="true"></span>',
        rmText: '<span class="fa fa-trash" aria-hidden="true"></span>',
      });

      offlineLayer.addTo(map);
      offlineControl.addTo(map);

      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const userLocation = [latitude, longitude];
            userLocationRef.current = userLocation;
            
            // Center map on user location
            map.setView(userLocation, 15);
            
            // Create a custom icon for user location (blue dot)
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: '<div style="width: 16px; height: 16px; background-color: #4285f4; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });
            
            // Add marker for user location
            userMarkerRef.current = L.marker(userLocation, { icon: userIcon }).addTo(map);
            
            // Optional: Add accuracy circle
            L.circle(userLocation, {
              radius: position.coords.accuracy,
              color: '#4285f4',
              fillColor: '#4285f4',
              fillOpacity: 0.1,
              weight: 1
            }).addTo(map);

            // Notify parent that map is ready with user location
            if (onMapReady) {
              onMapReady({ map, userLocation });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            // Keep default location if geolocation fails
            if (onMapReady) {
              onMapReady({ map, userLocation: null });
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        if (onMapReady) {
          onMapReady({ map, userLocation: null });
        }
      }
    }
  }, [onMapReady]);

  // Update pin markers when pins change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentPinIds = new Set(pins.map(p => p.id));
    
    // Remove markers for pins that no longer exist
    Object.keys(pinMarkersRef.current).forEach(pinId => {
      if (!currentPinIds.has(Number(pinId))) {
        map.removeLayer(pinMarkersRef.current[pinId]);
        delete pinMarkersRef.current[pinId];
      }
    });

    // Add or update markers for current pins
    pins.forEach(pin => {
      if (pin.latLng) {
        if (pinMarkersRef.current[pin.id]) {
          // Update existing marker position
          pinMarkersRef.current[pin.id].setLatLng(pin.latLng);
        } else {
          // Create new marker
          const marker = L.marker(pin.latLng, {
            icon: createPinIcon(pin)
          }).addTo(map);
          
          marker.on('click', () => {
            if (onPinClick) onPinClick(pin);
          });
          
          pinMarkersRef.current[pin.id] = marker;
        }
      }
    });
  }, [pins, onPinClick]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 0 }}></div>;
};

export default Map;