import { useQuery } from '@tanstack/react-query';

export interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
}

export interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  photos: string[];
  location: {
    lat: number;
    lng: number;
  };
  reviewsList?: Review[];
}

interface SearchResponse {
  results: Business[];
  total: number;
  page: number;
  totalPages: number;
}

interface SearchParams {
  query: string;
  location: string;
  page?: number;
  limit?: number;
}

export function useSearch({ query, location, page = 1, limit = 10 }: SearchParams) {
  return useQuery<SearchResponse>({
    queryKey: ['/api/search', query, location, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        query, 
        location,
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await fetch(`/api/search?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    enabled: Boolean(query && location),
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
    retry: (failureCount, error) => {
      // Only retry network errors, not validation errors
      if (error instanceof Error && error.message.includes('400')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
