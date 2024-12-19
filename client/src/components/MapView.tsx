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
        const marker = new AdvancedMarkerElement({
          position: business.location,
          map: mapInstanceRef.current,
          title: business.name,
        });

        marker.addListener('click', () => onMarkerClick(business));
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
