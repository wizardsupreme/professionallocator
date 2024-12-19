import { useEffect, useRef } from 'react';
import type { Business } from '../hooks/use-search';

interface MapViewProps {
  businesses: Business[];
  selectedBusiness?: Business;
  onMarkerClick: (business: Business) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function MapView({ businesses, selectedBusiness, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // NYC default
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: defaultCenter,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !businesses.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    const bounds = new window.google.maps.LatLngBounds();
    
    businesses.forEach(business => {
      const marker = new window.google.maps.Marker({
        position: business.location,
        map: mapInstanceRef.current,
        title: business.name,
        animation: business === selectedBusiness ? 
          window.google.maps.Animation.BOUNCE : undefined
      });

      marker.addListener('click', () => onMarkerClick(business));
      markersRef.current.push(marker);
      bounds.extend(business.location);
    });

    mapInstanceRef.current.fitBounds(bounds);
  }, [businesses, selectedBusiness]);

  return (
    <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
  );
}
