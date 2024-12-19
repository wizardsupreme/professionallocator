import { vi } from 'vitest';

interface MockMarkerInstance {
  addListener: ReturnType<typeof vi.fn>;
  setMap: ReturnType<typeof vi.fn>;
  map: google.maps.Map | null;
}

interface MockMapInstance {
  setCenter: ReturnType<typeof vi.fn>;
  fitBounds: ReturnType<typeof vi.fn>;
  setZoom: ReturnType<typeof vi.fn>;
}

interface MockLatLngBounds {
  extend: ReturnType<typeof vi.fn>;
}

export const mockMarkerInstance: MockMarkerInstance = {
  addListener: vi.fn(),
  setMap: vi.fn(),
  map: null,
};

export const mockMapInstance: MockMapInstance = {
  setCenter: vi.fn(),
  fitBounds: vi.fn(),
  setZoom: vi.fn(),
};

export const mockLatLngBounds: MockLatLngBounds = {
  extend: vi.fn(),
};

export const setupGoogleMock = () => {
  const google = {
    maps: {
      Map: vi.fn(() => mockMapInstance),
      LatLngBounds: vi.fn(() => mockLatLngBounds),
      marker: {
        AdvancedMarkerElement: vi.fn(() => mockMarkerInstance)
      },
      importLibrary: vi.fn().mockImplementation((library: string) => {
        switch (library) {
          case 'maps':
            return Promise.resolve({
              Map: vi.fn(() => mockMapInstance),
            });
          case 'marker':
            return Promise.resolve({
              AdvancedMarkerElement: vi.fn(() => mockMarkerInstance),
            });
          default:
            return Promise.reject(new Error(`Unknown library: ${library}`));
        }
      }),
    },
  };

  (global as any).google = google;
  return google;
};
