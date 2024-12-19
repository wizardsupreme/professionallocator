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
      const { query, location, page = '1', limit = '10' } = req.query as { 
        query: string, 
        location: string,
        page?: string,
        limit?: string 
      };
      
      if (!query || !location) {
        return res.status(400).send("Query and location are required");
      }

      // Mock data based on profession/query with real coordinates
      const professionBusinesses: Record<string, any[]> = {
        'massage therapist': [
          // Downtown Lisbon
          {
            id: "mt1",
            name: "Zen Massage & Wellness",
            address: "Rua da Prata 85, Lisboa",
            phone: "+351 21 321 4567",
            rating: 4.8,
            reviews: 156,
            photos: [],
            location: { lat: 38.7107, lng: -9.1368 }
          },
          {
            id: "mt2",
            name: "Lisboa Massage Center",
            address: "Av. da Liberdade 155, Lisboa",
            phone: "+351 21 432 5678",
            rating: 4.7,
            reviews: 123,
            photos: [],
            location: { lat: 38.7205, lng: -9.1422 }
          },
          {
            id: "mt3",
            name: "Therapeutic Touch Portugal",
            address: "Rua Augusta 45, Lisboa",
            phone: "+351 21 543 6789",
            rating: 4.9,
            reviews: 189,
            photos: [],
            location: { lat: 38.7108, lng: -9.1387 }
          },
          {
            id: "mt4",
            name: "Relaxation Oasis",
            address: "Av. da República 78, Lisboa",
            phone: "+351 21 654 7890",
            rating: 4.6,
            reviews: 92,
            photos: [],
            location: { lat: 38.7374, lng: -9.1468 }
          },
          {
            id: "mt5",
            name: "Holistic Healing Center",
            address: "Rua do Carmo 34, Lisboa",
            phone: "+351 21 765 8901",
            rating: 4.8,
            reviews: 145,
            photos: [],
            location: { lat: 38.7118, lng: -9.1400 }
          },
          {
            id: "mt6",
            name: "Urban Wellness Spa",
            address: "Rua do Século 12, Lisboa",
            phone: "+351 21 876 9012",
            rating: 4.5,
            reviews: 78,
            photos: [],
            location: { lat: 38.7156, lng: -9.1433 }
          },
          {
            id: "mt7",
            name: "Serenity Massage Studio",
            address: "Av. António Augusto de Aguiar 122, Lisboa",
            phone: "+351 21 987 0123",
            rating: 4.7,
            reviews: 112,
            photos: [],
            location: { lat: 38.7331, lng: -9.1520 }
          },
          {
            id: "mt8",
            name: "Balance & Harmony Center",
            address: "Rua das Flores 55, Lisboa",
            phone: "+351 21 098 1234",
            rating: 4.9,
            reviews: 167,
            photos: [],
            location: { lat: 38.7089, lng: -9.1355 }
          },
          {
            id: "mt9",
            name: "Wellness Journey",
            address: "Praça do Comércio 15, Lisboa",
            phone: "+351 21 109 2345",
            rating: 4.6,
            reviews: 98,
            photos: [],
            location: { lat: 38.7075, lng: -9.1364 }
          },
          {
            id: "mt10",
            name: "Healing Hands Spa",
            address: "Rua Nova do Almada 28, Lisboa",
            phone: "+351 21 210 3456",
            rating: 4.8,
            reviews: 143,
            photos: [],
            location: { lat: 38.7102, lng: -9.1397 }
          },
          {
            id: "mt11",
            name: "Tranquil Touch Therapy",
            address: "Rua Garrett 45, Lisboa",
            phone: "+351 21 321 4567",
            rating: 4.7,
            reviews: 89,
            photos: [],
            location: { lat: 38.7112, lng: -9.1422 }
          },
          {
            id: "mt12",
            name: "Mind & Body Balance",
            address: "Av. da República 234, Lisboa",
            phone: "+351 21 432 5678",
            rating: 4.5,
            reviews: 76,
            photos: [],
            location: { lat: 38.7374, lng: -9.1468 }
          },
          {
            id: "mt13",
            name: "Peaceful Moments Spa",
            address: "Rua do Ouro 67, Lisboa",
            phone: "+351 21 543 6789",
            rating: 4.6,
            reviews: 104,
            photos: [],
            location: { lat: 38.7103, lng: -9.1374 }
          },
          {
            id: "mt14",
            name: "Natural Healing Studio",
            address: "Av. Almirante Reis 189, Lisboa",
            phone: "+351 21 654 7890",
            rating: 4.8,
            reviews: 132,
            photos: [],
            location: { lat: 38.7198, lng: -9.1347 }
          },
          {
            id: "mt15",
            name: "Lotus Wellness Center",
            address: "Rua da Madalena 91, Lisboa",
            phone: "+351 21 765 8901",
            rating: 4.7,
            reviews: 118,
            photos: [],
            location: { lat: 38.7112, lng: -9.1352 }
          }
        ],
        'electrician': [
          // Downtown Lisbon
          {
            id: "1",
            name: "Lisboa Electrical Services",
            address: "Rua da Prata 125, Lisboa",
            phone: "+351 21 123 4567",
            rating: 4.7,
            reviews: 89,
            photos: [],
            location: { lat: 38.7107, lng: -9.1368 }
          },
          {
            id: "2",
            name: "Power Solutions Lda",
            address: "Av. Almirante Reis 45, Lisboa",
            phone: "+351 21 234 5678",
            rating: 4.5,
            reviews: 67,
            photos: [],
            location: { lat: 38.7198, lng: -9.1347 }
          },
          // Baixa-Chiado Area
          {
            id: "3",
            name: "Electric Pros Portugal",
            address: "Rua Augusta 78, Lisboa",
            phone: "+351 21 345 6789",
            rating: 4.8,
            reviews: 124,
            photos: [],
            location: { lat: 38.7108, lng: -9.1387 }
          },
          // Avenidas Novas
          {
            id: "4",
            name: "24/7 Electrical Services",
            address: "Av. da República 234, Lisboa",
            phone: "+351 21 456 7890",
            rating: 4.3,
            reviews: 45,
            photos: [],
            location: { lat: 38.7374, lng: -9.1468 }
          },
          // Chiado
          {
            id: "5",
            name: "Smart Electric Solutions",
            address: "Rua do Carmo 56, Lisboa",
            phone: "+351 21 567 8901",
            rating: 4.6,
            reviews: 93,
            photos: [],
            location: { lat: 38.7118, lng: -9.1400 }
          },
          // Avenida Area
          {
            id: "6",
            name: "Green Electric Company",
            address: "Av. da Liberdade 189, Lisboa",
            phone: "+351 21 678 9012",
            rating: 4.4,
            reviews: 78,
            photos: [],
            location: { lat: 38.7205, lng: -9.1422 }
          },
          // Campo Pequeno
          {
            id: "7",
            name: "Campo Pequeno Electricians",
            address: "Av. República 46, Lisboa",
            phone: "+351 21 789 0123",
            rating: 4.2,
            reviews: 56,
            photos: [],
            location: { lat: 38.7430, lng: -9.1470 }
          },
          // Parque das Nações
          {
            id: "8",
            name: "Modern Electric Solutions",
            address: "Alameda dos Oceanos 33, Lisboa",
            phone: "+351 21 890 1234",
            rating: 4.6,
            reviews: 112,
            photos: [],
            location: { lat: 38.7687, lng: -9.0974 }
          },
          // Benfica
          {
            id: "9",
            name: "Benfica Electric Experts",
            address: "Estrada de Benfica 245, Lisboa",
            phone: "+351 21 901 2345",
            rating: 4.3,
            reviews: 89,
            photos: [],
            location: { lat: 38.7506, lng: -9.1988 }
          },
          // Alcântara
          {
            id: "10",
            name: "Alcântara Power Services",
            address: "Rua de Alcântara 92, Lisboa",
            phone: "+351 21 012 3456",
            rating: 4.4,
            reviews: 67,
            photos: [],
            location: { lat: 38.7033, lng: -9.1744 }
          },
          // Belém
          {
            id: "11",
            name: "Belém Electrical Masters",
            address: "Rua de Belém 45, Lisboa",
            phone: "+351 21 123 4567",
            rating: 4.7,
            reviews: 134,
            photos: [],
            location: { lat: 38.6970, lng: -9.2069 }
          },
          // Alfama
          {
            id: "12",
            name: "Alfama Electric Works",
            address: "Rua dos Remédios 45, Lisboa",
            phone: "+351 21 234 5678",
            rating: 4.5,
            reviews: 78,
            photos: [],
            location: { lat: 38.7121, lng: -9.1307 }
          },
          // Graça
          {
            id: "13",
            name: "Graça Power Systems",
            address: "Rua da Graça 89, Lisboa",
            phone: "+351 21 345 6789",
            rating: 4.2,
            reviews: 45,
            photos: [],
            location: { lat: 38.7178, lng: -9.1313 }
          },
          // Príncipe Real
          {
            id: "14",
            name: "Royal Electric Services",
            address: "Rua do Príncipe Real 34, Lisboa",
            phone: "+351 21 456 7890",
            rating: 4.8,
            reviews: 156,
            photos: [],
            location: { lat: 38.7178, lng: -9.1477 }
          },
          // Cais do Sodré
          {
            id: "15",
            name: "Riverside Electrical",
            address: "Rua do Alecrim 23, Lisboa",
            phone: "+351 21 567 8901",
            rating: 4.6,
            reviews: 98,
            photos: [],
            location: { lat: 38.7070, lng: -9.1436 }
          },
          // São Bento
          {
            id: "16",
            name: "São Bento Electric Co",
            address: "Rua de São Bento 199, Lisboa",
            phone: "+351 21 678 9012",
            rating: 4.4,
            reviews: 87,
            photos: [],
            location: { lat: 38.7153, lng: -9.1527 }
          },
          // Campo de Ourique
          {
            id: "17",
            name: "Campo Electric Experts",
            address: "Rua Ferreira Borges 67, Lisboa",
            phone: "+351 21 789 0123",
            rating: 4.3,
            reviews: 76,
            photos: [],
            location: { lat: 38.7183, lng: -9.1670 }
          },
          // Alvalade
          {
            id: "18",
            name: "Alvalade Power Solutions",
            address: "Av. da Igreja 45, Lisboa",
            phone: "+351 21 890 1234",
            rating: 4.5,
            reviews: 92,
            photos: [],
            location: { lat: 38.7520, lng: -9.1450 }
          },
          // Lumiar
          {
            id: "19",
            name: "Lumiar Electric Services",
            address: "Alameda das Linhas de Torres 156, Lisboa",
            phone: "+351 21 901 2345",
            rating: 4.4,
            reviews: 65,
            photos: [],
            location: { lat: 38.7700, lng: -9.1600 }
          },
          // Areeiro
          {
            id: "20",
            name: "Areeiro Power Systems",
            address: "Av. de Roma 89, Lisboa",
            phone: "+351 21 012 3456",
            rating: 4.6,
            reviews: 108,
            photos: [],
            location: { lat: 38.7420, lng: -9.1340 }
          }
        ],
        // Add more profession-specific businesses here
      };

      // Default results array with exact coordinates for general businesses
      function generateDefaultResults() {
        const businesses = [
          // Baixa-Chiado District
          {
            name: "Professional Solutions Lda",
            address: "Av. da Liberdade 110, Lisboa",
            location: { lat: 38.7189, lng: -9.1428 }
          },
          {
            name: "Business Services Portugal",
            address: "Rua Augusta 25, Lisboa",
            location: { lat: 38.7099, lng: -9.1397 }
          },
          {
            name: "Lisbon Consulting Group",
            address: "Praça do Comércio, Lisboa",
            location: { lat: 38.7075, lng: -9.1364 }
          },
          // Avenidas Novas District
          {
            name: "Expert Services Network",
            address: "Av. da República 45, Lisboa",
            location: { lat: 38.7350, lng: -9.1459 }
          },
          {
            name: "Metro Business Center",
            address: "Rua do Ouro 12, Lisboa",
            location: { lat: 38.7103, lng: -9.1374 }
          },
          {
            name: "Capital Professional Services",
            address: "Av. António Augusto de Aguiar 90, Lisboa",
            location: { lat: 38.7331, lng: -9.1520 }
          },
          // Parque das Nações District
          {
            name: "Innovation Hub Lisboa",
            address: "Alameda dos Oceanos 123, Lisboa",
            location: { lat: 38.7687, lng: -9.0974 }
          },
          {
            name: "Tech Valley Services",
            address: "Passeio do Levante 25, Lisboa",
            location: { lat: 38.7631, lng: -9.0952 }
          },
          // Belém District
          {
            name: "Belém Business Center",
            address: "Rua de Belém 45, Lisboa",
            location: { lat: 38.6970, lng: -9.2069 }
          },
          {
            name: "Riverside Consulting",
            address: "Av. Brasília 15, Lisboa",
            location: { lat: 38.6965, lng: -9.1800 }
          },
          // Alfama District
          {
            name: "Historic Quarter Services",
            address: "Rua dos Remédios 78, Lisboa",
            location: { lat: 38.7121, lng: -9.1307 }
          },
          {
            name: "Alfama Business Solutions",
            address: "Rua de São Miguel 34, Lisboa",
            location: { lat: 38.7133, lng: -9.1317 }
          },
          // Campo de Ourique District
          {
            name: "Campo Professional Center",
            address: "Rua Ferreira Borges 89, Lisboa",
            location: { lat: 38.7183, lng: -9.1670 }
          },
          {
            name: "Business Innovation Lab",
            address: "Rua Saraiva de Carvalho 45, Lisboa",
            location: { lat: 38.7167, lng: -9.1689 }
          },
          // Príncipe Real District
          {
            name: "Creative Business Hub",
            address: "Rua da Escola Politécnica 56, Lisboa",
            location: { lat: 38.7178, lng: -9.1477 }
          },
          {
            name: "Design District Services",
            address: "Rua Dom Pedro V 89, Lisboa",
            location: { lat: 38.7164, lng: -9.1466 }
          },
          // Cais do Sodré District
          {
            name: "Waterfront Business Center",
            address: "Rua do Alecrim 45, Lisboa",
            location: { lat: 38.7070, lng: -9.1436 }
          },
          {
            name: "Pink Street Services",
            address: "Rua Nova do Carvalho 23, Lisboa",
            location: { lat: 38.7067, lng: -9.1445 }
          },
          // Alvalade District
          {
            name: "Alvalade Business Park",
            address: "Av. da Igreja 67, Lisboa",
            location: { lat: 38.7520, lng: -9.1450 }
          },
          {
            name: "Roma Business Center",
            address: "Av. de Roma 123, Lisboa",
            location: { lat: 38.7420, lng: -9.1340 }
          }
        ];

        // Add common fields and generate unique IDs
        return businesses.map((business, index) => ({
          id: (index + 1).toString(),
          ...business,
          phone: `+351 21 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
          reviews: Math.floor(50 + Math.random() * 150),
          photos: []
        }));
      }

      const defaultResults = generateDefaultResults();

      // Get results based on profession or default
      // Normalize the query to handle variations
      const normalizedQuery = query.toLowerCase().trim();
      
      // Get results based on profession or default
      let results = defaultResults;
      
      // Check for profession matches
      if (normalizedQuery) {
        for (const [profession, businesses] of Object.entries(professionBusinesses)) {
          // Make the search more flexible by checking partial matches
          if (profession.toLowerCase().includes(normalizedQuery) || 
              normalizedQuery.includes(profession.toLowerCase()) ||
              // Check individual words
              profession.toLowerCase().split(' ').some(word => 
                normalizedQuery.includes(word) || 
                word.includes(normalizedQuery)
              )) {
            results = businesses;
            break;
          }
        }
      }

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

      // Apply pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      res.json({
        results: paginatedResults,
        total: results.length,
        page: pageNum,
        totalPages: Math.ceil(results.length / limitNum)
      });
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
