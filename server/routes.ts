import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
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

      // Here we would normally call the Google Places API
      // For now, return mock data
      const results = [
        {
          id: "1",
          name: "Business One",
          address: "123 Main St, City",
          phone: "(555) 123-4567",
          rating: 4.5,
          reviews: 123,
          photos: [],
          location: { lat: 40.7128, lng: -74.0060 }
        },
        // Add more mock businesses...
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
