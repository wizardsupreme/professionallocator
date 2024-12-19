interface CacheEntry {
  data: any;
  timestamp: number;
}

interface CacheOptions {
  ttl: number; // Time to live in milliseconds
}

class SearchCache {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number;

  constructor(options: CacheOptions = { ttl: 1000 * 60 * 15 }) { // Default 15 minutes TTL
    this.cache = new Map();
    this.defaultTTL = options.ttl;
  }

  private generateKey(query: string, location: string, page: string, limit: string): string {
    return `${query}:${location}:${page}:${limit}`;
  }

  get(query: string, location: string, page: string, limit: string): any | null {
    const key = this.generateKey(query, location, page, limit);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(query: string, location: string, page: string, limit: string, data: any): void {
    const key = this.generateKey(query, location, page, limit);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean up old entries periodically
    if (this.cache.size > 1000) { // Arbitrary limit to prevent memory leaks
      this.cleanup();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const searchCache = new SearchCache();
