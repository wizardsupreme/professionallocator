import { useEffect, useRef, useState } from 'react';
import type { Business } from '../hooks/use-search';
import { loadMapsApi } from '../lib/maps';

interface MapViewProps {
  businesses: Business[];
  selectedBusiness?: Business;
  onMarkerClick: (business: Business) => void;
}

export function MapView({ businesses, selectedBusiness, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [error, setError] = useState<string>();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        const element = mapRef.current;
        if (!element) return;

        await loadMapsApi();
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        await google.maps.importLibrary("marker");
        
        const defaultCenter = { lat: 38.7223, lng: -9.1393 }; // Lisbon default
        
        mapInstanceRef.current = new Map(element, {
          zoom: 12,
          center: defaultCenter,
          mapId: 'DEMO_MAP_ID',
          disableDefaultUI: false,
          clickableIcons: false
        });

        // Add styles for bounce animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `;
        document.head.appendChild(style);

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Failed to initialize Google Maps");
      }
    };

    initMap();

    return () => {
      // Clean up markers
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
      // Remove animation style
      const style = document.querySelector('style');
      if (style?.textContent.includes('bounce')) {
        style.remove();
      }
    };
  }, []);

  // Update markers when businesses change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current || !businesses.length || !isInitialized) return;

      try {
        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        const bounds = new google.maps.LatLngBounds();
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
        
        businesses.forEach(business => {
          const pin = document.createElement('div');
          pin.innerHTML = `
            <div style="cursor: pointer; transform-origin: center bottom;">
              <svg width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 32 16 32s16-20 16-32c0-8.836-7.164-16-16-16z" fill="#FF4444"/>
                <circle cx="16" cy="16" r="8" fill="white"/>
              </svg>
            </div>
          `;

          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position: business.location,
            title: business.name,
            content: pin
          });

          marker.addListener('click', () => {
            const pinElement = pin.querySelector('div');
            if (pinElement) {
              pinElement.style.animation = 'bounce 0.5s';
              setTimeout(() => {
                pinElement.style.animation = '';
              }, 500);
            }
            onMarkerClick(business);
          });
            
          markersRef.current.push(marker);
          bounds.extend(business.location);
        });

        // Adjust bounds
        if (businesses.length > 1) {
          mapInstanceRef.current.fitBounds(bounds, {
            padding: { top: 50, right: 50, bottom: 50, left: 50 }
          });
        } else if (businesses.length === 1) {
          mapInstanceRef.current.setCenter(businesses[0].location);
          mapInstanceRef.current.setZoom(14);
        }
      } catch (error) {
        console.error("Error updating markers:", error);
        setError("Failed to update map markers");
      }
    };

    updateMarkers();
  }, [businesses, selectedBusiness, isInitialized]);

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