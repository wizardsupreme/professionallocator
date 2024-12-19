import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend expect with Testing Library matchers
expect.extend(matchers);

// Mock ResizeObserver which is not available in jsdom
beforeAll(() => {
  // Create a mock ResizeObserver
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Add it to the global object
  global.ResizeObserver = ResizeObserverMock;

  // Mock window.google.maps
  global.google = {
    maps: {
      Map: vi.fn(),
      LatLngBounds: vi.fn(),
      importLibrary: vi.fn(),
    },
  } as any;
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  vi.resetAllMocks();
});
