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
        "lisbon": { lat: 38.7223, lng: -9.1393 }, // Praça do Comércio
        "porto": { lat: 41.1579, lng: -8.6291 }, // Avenida dos Aliados
        "faro": { lat: 37.0193, lng: -7.9304 } // Faro Old Town
      };

      const baseLocation = mockLocations[location.toLowerCase()] || { lat: 38.7223, lng: -9.1393 }; // Default to Lisbon

      // Mock data based on profession/query
      const professionBusinesses: Record<string, any[]> = {
        'electrician': [
          {
            id: "1",
            name: "Lisboa Electrical Services",
            address: "Rua da Prata 125, Lisboa",
            phone: "+351 21 123 4567",
            rating: 4.7,
            reviews: 89,
            photos: [],
            location: { lat: baseLocation.lat + 0.01, lng: baseLocation.lng + 0.01 }
          },
          {
            id: "2",
            name: "Power Solutions Lda",
            address: "Av. Almirante Reis 45, Lisboa",
            phone: "+351 21 234 5678",
            rating: 4.5,
            reviews: 67,
            photos: [],
            location: { lat: baseLocation.lat - 0.01, lng: baseLocation.lng - 0.01 }
          },
          {
            id: "3",
            name: "Electric Pros Portugal",
            address: "Rua Augusta 78, Lisboa",
            phone: "+351 21 345 6789",
            rating: 4.8,
            reviews: 124,
            photos: [],
            location: { lat: baseLocation.lat + 0.02, lng: baseLocation.lng + 0.02 }
          },
          {
            id: "4",
            name: "24/7 Electrical Services",
            address: "Av. da República 234, Lisboa",
            phone: "+351 21 456 7890",
            rating: 4.3,
            reviews: 45,
            photos: [],
            location: { lat: baseLocation.lat - 0.02, lng: baseLocation.lng - 0.02 }
          },
          {
            id: "5",
            name: "Smart Electric Solutions",
            address: "Rua do Carmo 56, Lisboa",
            phone: "+351 21 567 8901",
            rating: 4.6,
            reviews: 93,
            photos: [],
            location: { lat: baseLocation.lat + 0.03, lng: baseLocation.lng + 0.03 }
          },
          {
            id: "6",
            name: "Green Electric Company",
            address: "Av. da Liberdade 189, Lisboa",
            phone: "+351 21 678 9012",
            rating: 4.4,
            reviews: 78,
            photos: [],
            location: { lat: baseLocation.lat - 0.03, lng: baseLocation.lng - 0.03 }
          }
        ],
        // Add more profession-specific businesses here
      };

      // Default results if no profession match
      const defaultResults = [
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
        },
        {
          id: "4",
          name: "Expert Services Network",
          address: "Av. da República 45, Lisboa",
          phone: "+351 21 444 5678",
          rating: 4.3,
          reviews: 78,
          photos: [],
          location: { lat: baseLocation.lat - 0.02, lng: baseLocation.lng + 0.01 }
        },
        {
          id: "5",
          name: "Metro Business Center",
          address: "Rua do Ouro 12, Lisboa",
          phone: "+351 21 333 9876",
          rating: 4.6,
          reviews: 112,
          photos: [],
          location: { lat: baseLocation.lat + 0.015, lng: baseLocation.lng - 0.02 }
        },
        {
          id: "6",
          name: "Capital Professional Services",
          address: "Av. António Augusto de Aguiar 90, Lisboa",
          phone: "+351 21 222 3456",
          rating: 4.4,
          reviews: 95,
          photos: [],
          location: { lat: baseLocation.lat - 0.015, lng: baseLocation.lng - 0.01 }
        }
      ];

      // Get results based on profession or default
      let results = professionBusinesses[query.toLowerCase()] || defaultResults;

      // Use exact locations without random variations
      results = results.map(result => ({
        ...result,
        location: {
          lat: result.location.lat,
          lng: result.location.lng
        }
      }));

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
