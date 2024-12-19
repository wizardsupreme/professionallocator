import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth.js";
import { db } from "@db";
import { searchHistory } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/search", async (req, res) => {
    try {
      const { query, location } = req.query as { query: string, location: string };
      
      if (!query || !location) {
        return res.status(400).send("Query and location are required");
      }

      // Mock data for testing
      const mockLocations = {
        "lisbon": { lat: 38.7223, lng: -9.1393 },
        "porto": { lat: 41.1579, lng: -8.6291 },
        "faro": { lat: 37.0193, lng: -7.9304 }
      };

      const baseLocation = mockLocations[location.toLowerCase()] || { lat: 38.7223, lng: -9.1393 }; // Default to Lisbon

      const results = [
        {
          id: "1",
          name: "Professional Solutions Lda",
          address: "Av. da Liberdade 110, Lisboa",
          phone: "+351 21 123 4567",
          rating: 4.5,
          reviews: 123,
          photos: [],
          location: { lat: baseLocation.lat + 0.01, lng: baseLocation.lng + 0.01 }
        },
        {
          id: "2",
          name: "Business Services Portugal",
          address: "Rua Augusta 25, Lisboa",
          phone: "+351 21 987 6543",
          rating: 4.2,
          reviews: 89,
          photos: [],
          location: { lat: baseLocation.lat - 0.01, lng: baseLocation.lng - 0.01 }
        },
        {
          id: "3",
          name: "Lisbon Consulting Group",
          address: "Praça do Comércio, Lisboa",
          phone: "+351 21 555 0123",
          rating: 4.8,
          reviews: 156,
          photos: [],
          location: { lat: baseLocation.lat, lng: baseLocation.lng + 0.02 }
        }
      ];

      // Save search history if user is logged in
      if (req.user?.id) {
        await db.insert(searchHistory).values({
          userId: req.user.id,
          query,
          location,
          results
        });
      }

      res.json(results);
    } catch (error) {
      res.status(500).send("Internal server error");
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
