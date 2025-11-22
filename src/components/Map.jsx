import { useEffect, useRef, useState } from 'preact/hooks';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.offline';
import { CATEGORIES } from '../constants';
import { DownloadNotification } from './DownloadNotification';

const Map = ({ pins, onPinClick, onMapReady, userLocation, isOnline, onDownloadStateChange }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userLocationRef = useRef(null);
  const pinMarkersRef = useRef({});
  const offlineControlRef = useRef(null);
  const offlineLayerRef = useRef(null);
  const hasDownloadedRef = useRef(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);
  const [showDownloadComplete, setShowDownloadComplete] = useState(false);

  // Notify parent of download state changes
  useEffect(() => {
    console.log('Download state changed:', { isDownloading, downloadProgress, downloadTotal, showDownloadComplete });
    if (onDownloadStateChange) {
      onDownloadStateChange({
        isDownloading,
        downloadProgress,
        downloadTotal,
        showDownloadComplete
      });
    }
  }, [isDownloading, downloadProgress, downloadTotal, showDownloadComplete, onDownloadStateChange]);

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

  const mapReadyCalledRef = useRef(false);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const initialView = userLocation || [51.505, -0.09];
      const map = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView(initialView, 13);
      mapRef.current = map;

      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div style="width: 16px; height: 16px; background-color: #4285f4; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        userMarkerRef.current = L.marker(userLocation, { icon: userIcon }).addTo(map);
      }

      const offlineLayer = L.tileLayer.offline('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        minZoom: 11,
        maxZoom: 16,
      });
      offlineLayerRef.current = offlineLayer;

      // Calculate bounds for 3km radius around user location
      const getBoundsFor3kmRadius = (center) => {
        // Approximate: 1 degree latitude ≈ 111km
        const latOffset = 3 / 111; // 3km in degrees
        const lngOffset = 3 / (111 * Math.cos(center[0] * Math.PI / 180));
        
        return L.latLngBounds(
          [center[0] - latOffset, center[1] - lngOffset],
          [center[0] + latOffset, center[1] + lngOffset]
        );
      };

      const offlineControl = L.control.savetiles(offlineLayer, {
        saveText: '<i class="fa fa-download"></i> Descargar Mapa',
        rmText: '<i class="fa fa-trash"></i> Eliminar',
        maxZoom: 16,
        saveWhatYouSee: false,
        bounds: null, // Will be set dynamically
        confirm: null,
        confirmRemoval: null,
        parallel: 10, // Download 10 tiles in parallel
        zoomlevels: [13, 14, 15, 16], // Download these zoom levels
        alwaysDownload: false
      });
      offlineControlRef.current = offlineControl;

      offlineLayer.addTo(map);
      offlineControl.addTo(map); // Must be added to map for _calculateTiles() to work

      // Event listeners for download progress - attach to baseLayer, not control
      offlineLayer.on('savestart', (e) => {
        console.log('Download started:', e);
        const totalTiles = e.lengthToBeSaved || 0;
        console.log(`savestart event - total tiles: ${totalTiles}`);
        console.log('Setting isDownloading to true');
        setIsDownloading(true);
        setDownloadTotal(totalTiles);
        setDownloadProgress(0);
      });

      offlineLayer.on('loadtileend', (e) => {
        const newProgress = (e.lengthLoaded || 0);
        setDownloadProgress(newProgress);
        console.log(`Progress: ${newProgress}/${e.lengthToBeSaved}`);
      });

      offlineLayer.on('savetileend', () => {
        // Tile saved to IndexedDB
      });

      offlineLayer.on('saveend', () => {
        console.log('Download completed - saveend event fired');
        console.log('Setting isDownloading to false and showDownloadComplete to true');
        setIsDownloading(false);
        hasDownloadedRef.current = true;
        // Show success message briefly, then hide everything
        setShowDownloadComplete(true);
        setTimeout(() => {
          console.log('Hiding download complete message');
          setShowDownloadComplete(false);
        }, 5000);
      });

      offlineLayer.on('tilesremoved', () => {
        console.log('Tiles removed from storage');
        hasDownloadedRef.current = false;
      });

      const onLocationFound = (location) => {
        if (mapReadyCalledRef.current) return;
        mapReadyCalledRef.current = true;
        addLog(`Map: location found: ${location}`);

        userLocationRef.current = location;
        map.setView(location, 15);

        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div style="width: 16px; height: 16px; background-color: #4285f4; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        userMarkerRef.current = L.marker(location, { icon: userIcon }).addTo(map);

        // Set bounds for offline download (3km radius)
        const bounds = getBoundsFor3kmRadius(location);
        offlineControl.options.bounds = bounds;

        if (onMapReady) {
          addLog('Map: calling onMapReady with location');
          onMapReady({ map, userLocation: location });
        }

        // Auto-download map tiles when location is found and online
        if (isOnline && !hasDownloadedRef.current) {
          console.log('Checking if tiles need to be downloaded...');
          
          setTimeout(() => {
            // Calculate tiles that need to be saved
            const tiles = offlineControl._calculateTiles();
            console.log(`Tiles to download: ${tiles.length}`);
            
            if (tiles.length === 0) {
              console.log('All tiles already downloaded, skipping auto-download');
              hasDownloadedRef.current = true;
            } else {
              console.log('Starting automatic map download for 3km radius...');
              setDownloadTotal(tiles.length);
              offlineControl._saveTiles();
            }
          }, 2000); // Wait 2 seconds before checking
        }
      };

      const onLocationError = () => {
        if (mapReadyCalledRef.current) return;
        mapReadyCalledRef.current = true;
        addLog('Map: location error. Using default.');
        console.error('Could not get location. Using default.');
        if (onMapReady) {
          addLog('Map: calling onMapReady with default location');
          onMapReady({ map, userLocation: [51.505, -0.09] });
        }
      };

      addLog('Map: setting location timeout');
      const locationTimeout = setTimeout(onLocationError, 10000);

      if (navigator.geolocation) {
        addLog('Map: geolocation is available, calling getCurrentPosition');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            addLog('Map: getCurrentPosition success');
            clearTimeout(locationTimeout);
            onLocationFound([position.coords.latitude, position.coords.longitude]);
          },
          () => {
            addLog('Map: getCurrentPosition error');
            clearTimeout(locationTimeout);
            onLocationError();
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        addLog('Map: geolocation is not available');
        clearTimeout(locationTimeout);
        onLocationError();
      }
    } else {
      addLog('Map: useEffect finished without initializing map');
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

  // Monitor online/offline status changes
  useEffect(() => {
    if (isOnline && userLocationRef.current && offlineControlRef.current && !hasDownloadedRef.current) {
      // When coming back online and haven't downloaded yet, check if download is needed
      console.log('Back online - checking if map needs download...');
      const bounds = offlineControlRef.current.options.bounds;
      if (!bounds && userLocationRef.current) {
        // Calculate and set bounds if not set
        const latOffset = 3 / 111;
        const lngOffset = 3 / (111 * Math.cos(userLocationRef.current[0] * Math.PI / 180));
        offlineControlRef.current.options.bounds = L.latLngBounds(
          [userLocationRef.current[0] - latOffset, userLocationRef.current[1] - lngOffset],
          [userLocationRef.current[0] + latOffset, userLocationRef.current[1] + lngOffset]
        );
      }
      
      setTimeout(() => {
        // Calculate tiles that need to be saved
        const tiles = offlineControlRef.current._calculateTiles();
        console.log(`Tiles to download: ${tiles.length}`);
        
        if (tiles.length === 0) {
          console.log('All tiles already downloaded, skipping download');
          hasDownloadedRef.current = true;
        } else {
          console.log('Starting map download...');
          setDownloadTotal(tiles.length);
          offlineControlRef.current._saveTiles();
        }
      }, 1000);
    }
  }, [isOnline]);

  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 0 }}>
      {!isOnline && (
        <div className="absolute top-20 left-4 bg-yellow-400 text-gray-800 p-3 rounded-lg shadow-lg z-50 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <span className="font-semibold">Modo sin conexión</span>
        </div>
      )}
    </div>
  );
};

export default Map;