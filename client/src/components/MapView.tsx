import { useEffect, useRef, useState } from 'react';
import type { Business } from '../hooks/use-search';
import { loadMapsApi } from '../lib/maps';
import { Star, Phone, MapPin } from 'lucide-react';

interface MapViewProps {
  businesses: Business[];
  selectedBusiness?: Business;
  onMarkerClick: (business: Business) => void;
}

interface InfoWindowContent {
  position: google.maps.LatLngLiteral;
  business: Business;
}

export function MapView({ businesses, selectedBusiness, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow>();
  const [error, setError] = useState<string>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [infoWindow, setInfoWindow] = useState<InfoWindowContent | null>(null);

  // Initialize map
  // Create info window content
  const createInfoWindowContent = (business: Business) => {
    const container = document.createElement('div');
    container.className = 'p-4 max-w-sm';
    container.innerHTML = `
      <div class="space-y-2">
        <h3 class="font-semibold text-lg">${business.name}</h3>
        <div class="flex items-center gap-1 text-yellow-500">
          ${Array.from({ length: Math.round(business.rating) })
            .map(() => '<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>')
            .join('')}
          <span class="text-sm text-gray-600 ml-1">(${business.reviews} reviews)</span>
        </div>
        <div class="text-gray-700 space-y-1">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="text-sm">${business.address}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span class="text-sm">${business.phone}</span>
          </div>
        </div>
      </div>
    `;
    return container;
  };

  useEffect(() => {
    const initMap = async () => {
      try {
        const element = mapRef.current;
        if (!element) return;

        await loadMapsApi();
        const { Map, InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        await google.maps.importLibrary("marker");
        
        const defaultCenter = { lat: 38.7223, lng: -9.1393 }; // Lisbon default
        
        mapInstanceRef.current = new Map(element, {
          zoom: 12,
          center: defaultCenter,
          mapId: 'DEMO_MAP_ID',
          disableDefaultUI: false,
          clickableIcons: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Initialize info window
        infoWindowRef.current = new InfoWindow({
          pixelOffset: new google.maps.Size(0, -40)
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
      // Close info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      // Remove animation style
      const style = document.querySelector('style');
      if (style?.textContent.includes('bounce')) {
        style.remove();
      }
    };
  }, []);

  // Update markers when businesses change
  // Handle marker click
  const handleMarkerClick = (business: Business, position: google.maps.LatLngLiteral) => {
    if (!infoWindowRef.current || !mapInstanceRef.current) return;

    // Update info window content and position
    infoWindowRef.current.setContent(createInfoWindowContent(business));
    infoWindowRef.current.setPosition(position);
    infoWindowRef.current.open(mapInstanceRef.current);
    
    // Notify parent component
    onMarkerClick(business);
  };

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
            handleMarkerClick(business, business.location);
          });
            
          markersRef.current.push(marker);
          bounds.extend(business.location);
        });

        // Close info window when clicking on the map
        mapInstanceRef.current.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
        });

        // Adjust bounds with padding
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