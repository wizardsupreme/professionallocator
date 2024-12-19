import { useQuery } from '@tanstack/react-query';
import { useUser } from './use-user';
import type { SearchHistory } from '@db/schema';

export function useSearchHistory() {
  const { user } = useUser();

  const { data: searchHistory } = useQuery<SearchHistory[]>({
    queryKey: ['/api/search/history'],
    enabled: !!user // Only fetch if user is logged in
  });

  const getSuggestions = (input: string, type: 'profession' | 'location') => {
    if (!searchHistory) return [];

    // Create a map to count occurrences and track recency
    const suggestionMap = new Map<string, { count: number, lastUsed: Date }>();

    searchHistory.forEach(entry => {
      const value = type === 'profession' ? entry.query : entry.location;
      const existing = suggestionMap.get(value);
      
      if (existing) {
        existing.count++;
        if (new Date(entry.createdAt) > existing.lastUsed) {
          existing.lastUsed = new Date(entry.createdAt);
        }
      } else {
        suggestionMap.set(value, {
          count: 1,
          lastUsed: new Date(entry.createdAt)
        });
      }
    });

    // Filter and sort suggestions
    return Array.from(suggestionMap.entries())
      .filter(([value]) => 
        value.toLowerCase().includes(input.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by frequency first
        const countDiff = b[1].count - a[1].count;
        if (countDiff !== 0) return countDiff;
        // Then by recency
        return b[1].lastUsed.getTime() - a[1].lastUsed.getTime();
      })
      .map(([value]) => value)
      .slice(0, 5); // Limit to top 5 suggestions
  };

  return {
    getProfessionSuggestions: (input: string) => getSuggestions(input, 'profession'),
    getLocationSuggestions: (input: string) => getSuggestions(input, 'location')
  };
}
