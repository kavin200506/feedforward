import React, { useEffect, useRef, useState } from 'react';
import './NgoMap.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const NgoMap = ({ 
  restaurantLat, 
  restaurantLng, 
  registeredNgos = [], 
  unregisteredNgos = [] 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps script if not already loaded
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your API key.');
      };
      document.head.appendChild(script);
    } else {
      // Script is loading, wait for it
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          setMapLoaded(true);
          initializeMap();
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && (restaurantLat || registeredNgos.length > 0 || unregisteredNgos.length > 0)) {
      updateMarkers();
    }
  }, [restaurantLat, restaurantLng, registeredNgos, unregisteredNgos, mapLoaded]);

  const initializeMap = () => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    if (!mapRef.current) return;

    // Default center (can be restaurant location or first NGO)
    let centerLat = restaurantLat || 12.9716; // Default to Bangalore
    let centerLng = restaurantLng || 77.5946;

    // If we have NGOs, center on the first one or restaurant
    if (registeredNgos.length > 0 && registeredNgos[0].latitude) {
      centerLat = registeredNgos[0].latitude;
      centerLng = registeredNgos[0].longitude;
    } else if (unregisteredNgos.length > 0 && unregisteredNgos[0].latitude) {
      centerLat = unregisteredNgos[0].latitude;
      centerLng = unregisteredNgos[0].longitude;
    }

    // Initialize map with satellite view
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 13,
      mapTypeId: window.google.maps.MapTypeId.SATELLITE,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: [
          window.google.maps.MapTypeId.ROADMAP,
          window.google.maps.MapTypeId.SATELLITE,
          window.google.maps.MapTypeId.HYBRID
        ]
      },
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });

    mapInstanceRef.current = map;
    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    // Add restaurant marker (blue)
    if (restaurantLat && restaurantLng) {
      const restaurantMarker = new window.google.maps.Marker({
        position: { lat: restaurantLat, lng: restaurantLng },
        map: mapInstanceRef.current,
        title: 'Your Restaurant',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#2196F3',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        },
        zIndex: 1000
      });

      const restaurantInfoWindow = new window.google.maps.InfoWindow({
        content: '<div style="padding: 8px;"><strong>Your Restaurant</strong></div>'
      });

      restaurantMarker.addListener('click', () => {
        restaurantInfoWindow.open(mapInstanceRef.current, restaurantMarker);
      });

      markersRef.current.push(restaurantMarker);
      bounds.extend({ lat: restaurantLat, lng: restaurantLng });
    }

    // Add registered NGOs markers (green)
    registeredNgos.forEach((ngo) => {
      if (ngo.latitude && ngo.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: ngo.latitude, lng: ngo.longitude },
          map: mapInstanceRef.current,
          title: ngo.organizationName || 'Registered NGO',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4CAF50', // Green
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          },
          zIndex: 500
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <strong>${ngo.organizationName || 'NGO'}</strong><br/>
              <span style="color: #4CAF50;">✅ Registered</span><br/>
              ${ngo.distanceKm ? `<span>Distance: ${ngo.distanceKm} km</span><br/>` : ''}
              ${ngo.beneficiariesCount ? `<span>Beneficiaries: ${ngo.beneficiariesCount}</span>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
        bounds.extend({ lat: ngo.latitude, lng: ngo.longitude });
      }
    });

    // Add unregistered NGOs markers (orange)
    unregisteredNgos.forEach((ngo) => {
      if (ngo.latitude && ngo.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: ngo.latitude, lng: ngo.longitude },
          map: mapInstanceRef.current,
          title: ngo.name || 'Unregistered NGO',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#FF9800', // Orange
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          },
          zIndex: 400
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <strong>${ngo.name || 'NGO'}</strong><br/>
              <span style="color: #FF9800;">📧 Not Registered</span><br/>
              ${ngo.distanceKm ? `<span>Distance: ${ngo.distanceKm} km</span><br/>` : ''}
              ${ngo.vicinity ? `<span>${ngo.vicinity}</span>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
        bounds.extend({ lat: ngo.latitude, lng: ngo.longitude });
      }
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      // Don't zoom in too much if there's only one marker
      if (markersRef.current.length === 1) {
        mapInstanceRef.current.setZoom(15);
      }
    }
  };

  if (error) {
    return (
      <div className="ngo-map-container">
        <div className="map-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="ngo-map-container">
        <div className="map-error">
          <p>⚠️ Google Maps API key is not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ngo-map-container">
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker blue"></span>
          <span>Your Restaurant</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker green"></span>
          <span>Registered NGOs ({registeredNgos.length})</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker orange"></span>
          <span>Unregistered NGOs ({unregisteredNgos.length})</span>
        </div>
      </div>
      <div ref={mapRef} className="ngo-map" />
      {!mapLoaded && (
        <div className="map-loading">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default NgoMap;



