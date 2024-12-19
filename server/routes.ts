import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth.js";
import { db } from "@db";
import { searchHistory } from "@db/schema";
import { eq } from "drizzle-orm";
import { Client } from "@googlemaps/google-maps-services-js";
import { searchCache } from "./cache";

// Clear the cache when server starts up
console.log('Clearing search cache on server startup...');
searchCache.clear();

const googleMapsClient = new Client({});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/search", async (req, res) => {
    try {
      const { query, location, page = '1', limit = '10' } = req.query as { 
        query: string, 
        location: string,
        page?: string,
        limit?: string 
      };

      if (!query || !location) {
        return res.status(400).send("Query and location are required");
      }

      // Check cache first
      const cachedResults = searchCache.get(query, location, page, limit);
      if (cachedResults) {
        console.log(`Cache hit for query: ${query}, location: ${location}`);
        return res.json(cachedResults);
      }

      console.log(`Cache miss for query: ${query}, location: ${location}`);

      // First, geocode the location to get coordinates
      const geocodeResponse = await googleMapsClient.geocode({
        params: {
          address: location,
          key: process.env.VITE_GOOGLE_MAPS_API_KEY!
        }
      });

      if (!geocodeResponse.data.results[0]) {
        return res.status(400).send("Location not found");
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

      // Then search for businesses using Places API
      const placesResponse = await googleMapsClient.textSearch({
        params: {
          query: `${query} near ${location}`,
          location: { lat, lng },
          radius: 50000, // 50km radius
          type: 'establishment',
          key: process.env.VITE_GOOGLE_MAPS_API_KEY!
        }
      });

      // Fetch detailed information for each place including reviews
      const results = await Promise.all(placesResponse.data.results.map(async place => {
        const detailsResponse = await googleMapsClient.placeDetails({
          params: {
            place_id: place.place_id,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'rating', 'user_ratings_total', 'photos', 'reviews', 'geometry'],
            key: process.env.VITE_GOOGLE_MAPS_API_KEY!
          }
        });

        const details = detailsResponse.data.result;
        
        return {
          id: place.place_id,
          name: details.name || place.name,
          address: details.formatted_address || place.formatted_address || '',
          phone: details.formatted_phone_number || '',
          rating: details.rating || place.rating || 0,
          reviews: details.user_ratings_total || place.user_ratings_total || 0,
          photos: details.photos ? details.photos.map(photo => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`
          ) : [],
          location: {
            lat: details.geometry?.location.lat || place.geometry?.location.lat || lat,
            lng: details.geometry?.location.lng || place.geometry?.location.lng || lng
          },
          reviewsList: details.reviews || []
        };
      }));

      // Save search history if user is logged in
      if (req.user?.id) {
        await db.insert(searchHistory).values({
          userId: req.user.id,
          query,
          location,
          createdAt: new Date()
        });
      }

      // Apply pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedResults = results.slice(startIndex, endIndex);

      const response = {
        results: paginatedResults,
        total: results.length,
        page: pageNum,
        totalPages: Math.ceil(results.length / limitNum)
      };

      // Cache the results
      searchCache.set(query, location, page, limit, response);

      res.json(response);
    } catch (error: any) {
      console.error('Search error:', error);
      res.status(500).send(error.message || "Internal server error");
    }
  });

  app.get("/api/search/history", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const history = await db.select()
        .from(searchHistory)
        .where(eq(searchHistory.userId, req.user.id))
        .orderBy(searchHistory.createdAt);

      res.json(history);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}