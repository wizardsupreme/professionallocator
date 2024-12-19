import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MapView } from '../MapView';
import { setupGoogleMock, mockMapInstance, mockMarkerInstance } from '../../test/mocks/googleMaps';
import type { Business } from '../../hooks/use-search';

describe('MapView', () => {
  const mockBusinesses: Business[] = [
    {
      id: '1',
      name: 'Test Business 1',
      location: { lat: 38.7223, lng: -9.1393 },
      address: 'Test Address 1',
      phone: '123-456-7890',
      rating: 4.5,
      reviews: 100,
      photos: []
    },
    {
      id: '2',
      name: 'Test Business 2',
      location: { lat: 38.7224, lng: -9.1394 },
      address: 'Test Address 2',
      phone: '123-456-7891',
      rating: 4.0,
      reviews: 50,
      photos: []
    }
  ];

  beforeEach(() => {
    setupGoogleMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes map with correct configuration', async () => {
    render(
      <MapView
        businesses={mockBusinesses}
        onMarkerClick={() => {}}
      />
    );

    await waitFor(() => {
      expect(google.maps.Map).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({
          zoom: 12,
          mapId: 'DEMO_MAP_ID'
        })
      );
    });
  });

  it('creates markers with correct styling for each business', async () => {
    render(
      <MapView
        businesses={mockBusinesses}
        onMarkerClick={() => {}}
      />
    );

    await waitFor(() => {
      // Check if markers are created for each business
      expect(google.maps.marker.AdvancedMarkerElement)
        .toHaveBeenCalledTimes(mockBusinesses.length);
      
      // Verify marker content contains SVG with correct styling
      const markerCalls = (google.maps.marker.AdvancedMarkerElement as any).mock.calls;
      markerCalls.forEach((call: any, index: number) => {
        const options = call[0];
        expect(options.position).toEqual(mockBusinesses[index].location);
        expect(options.title).toBe(mockBusinesses[index].name);
        
        // Check if marker content includes SVG
        const content = options.content as HTMLDivElement;
        expect(content.innerHTML).toContain('<svg');
        expect(content.innerHTML).toContain('fill="#FF4444"');
      });
    });
  });

  it('handles marker click events correctly', async () => {
    const onMarkerClick = vi.fn();
    
    render(
      <MapView
        businesses={mockBusinesses}
        onMarkerClick={onMarkerClick}
      />
    );

    await waitFor(async () => {
      const [[markerOptions]] = (google.maps.marker.AdvancedMarkerElement as any).mock.calls;
      const clickListener = mockMarkerInstance.addListener.mock.calls[0][1];
      
      // Simulate marker click
      clickListener();
      
      expect(onMarkerClick).toHaveBeenCalledWith(mockBusinesses[0]);
      
      // Check if animation was added
      const content = markerOptions.content as HTMLDivElement;
      expect(content.querySelector('div')?.style.animation).toBe('bounce 0.5s');
      
      // Wait for animation to be cleared
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(content.querySelector('div')?.style.animation).toBe('');
    });
  });

  it('handles map initialization errors gracefully', async () => {
    // Mock Google Maps loading failure
    vi.spyOn(global.google.maps, 'importLibrary').mockRejectedValueOnce(new Error('Failed to load'));

    render(
      <MapView
        businesses={mockBusinesses}
        onMarkerClick={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to initialize Google Maps/i)).toBeInTheDocument();
    });
  });

  it('updates markers when businesses change', async () => {
    const { rerender } = render(
      <MapView
        businesses={[mockBusinesses[0]]}
        onMarkerClick={() => {}}
      />
    );

    await waitFor(() => {
      expect(google.maps.marker.AdvancedMarkerElement).toHaveBeenCalledTimes(1);
    });

    // Add another business
    rerender(
      <MapView
        businesses={mockBusinesses}
        onMarkerClick={() => {}}
      />
    );

    await waitFor(() => {
      expect(google.maps.marker.AdvancedMarkerElement).toHaveBeenCalledTimes(3); // 1 initial + 2 after update
    });
  });
});
