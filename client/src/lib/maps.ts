import { Loader } from '@googlemaps/js-api-loader';

export const mapsLoader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["maps", "marker", "places"],
  mapIds: ['DEMO_MAP_ID'] // Using a demo ID for development
});

// Load maps API once and cache the promise
let loadPromise: Promise<typeof google>;

export function loadMapsApi() {
  if (!loadPromise) {
    loadPromise = mapsLoader.load();
  }
  return loadPromise;
}
