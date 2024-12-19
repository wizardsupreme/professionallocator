import { useQuery } from '@tanstack/react-query';

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
  });
}
