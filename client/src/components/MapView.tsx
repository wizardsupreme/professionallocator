import { useEffect, useRef, useState } from 'react';
import type { Business } from '../hooks/use-search';
import { loadMapsApi } from '../lib/maps';

interface MapViewProps {
  businesses: Business[];
  selectedBusiness?: Business;
  onMarkerClick: (business: Business) => void;
}

// Explicitly declare types for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

export function MapView({ businesses, selectedBusiness, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const initMap = async () => {
      try {
        const element = mapRef.current;
        if (!element) return;

        await loadMapsApi();
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const defaultCenter = { lat: 38.7223, lng: -9.1393 }; // Lisbon default
        
        mapInstanceRef.current = new Map(element, {
          zoom: 12,
          center: defaultCenter,
          mapId: 'DEMO_MAP_ID'
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Failed to initialize Google Maps");
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current || !businesses.length) return;

      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];

      // Add new markers
      const bounds = new google.maps.LatLngBounds();
      
      businesses.forEach(business => {
        const marker = new google.maps.Marker({
          position: business.location,
          map: mapInstanceRef.current,
          title: business.name,
          animation: google.maps.Animation.DROP,
          icon: {
            url: `data:image/svg+xml,${encodeURIComponent(`
              <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.383 0 0 5.383 0 12c0 9 12 24 12 24s12-15 12-24c0-6.617-5.383-12-12-12z" fill="#DB4437"/>
                <circle cx="12" cy="12" r="7" fill="white"/>
              </svg>
            `)}`,
            anchor: new google.maps.Point(12, 36),
            scaledSize: new google.maps.Size(24, 36)
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          // Bounce animation for clicked marker
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(() => marker.setAnimation(null), 750);
          onMarkerClick(business);
        });
        
        markersRef.current.push(marker);
        bounds.extend(business.location);
      });

      mapInstanceRef.current.fitBounds(bounds);
    };

    updateMarkers();
  }, [businesses, selectedBusiness]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
  );
}
