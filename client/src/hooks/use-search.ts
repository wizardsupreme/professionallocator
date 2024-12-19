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

interface SearchParams {
  query: string;
  location: string;
}

export function useSearch({ query, location }: SearchParams) {
  return useQuery<Business[]>({
    queryKey: ['/api/search', query, location],
    queryFn: async () => {
      const params = new URLSearchParams({ query, location });
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
