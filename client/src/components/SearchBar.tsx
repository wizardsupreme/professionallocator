import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { loadMapsApi } from '../lib/maps';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
}

interface PlacePrediction {
  description: string;
  place_id: string;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    loadMapsApi().then(() => {
      autocompleteService.current = new google.maps.places.AutocompleteService();
    }).catch((error) => {
      console.error("Error loading Google Maps Places:", error);
    });
  }, []);

  useEffect(() => {
    if (!location || !autocompleteService.current) return;
    
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const response = await autocompleteService.current?.getPlacePredictions({
          input: location,
          types: ['(cities)']
        });
        setPredictions(response?.predictions || []);
        setShowPredictions(true);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timeoutId);
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPredictions(false);
    onSearch(query, location);
  };

  const handlePredictionClick = (prediction: PlacePrediction) => {
    setLocation(prediction.description);
    setPredictions([]);
    setShowPredictions(false);
  };

  return (
    <Card className="p-4 shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for businesses or services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowPredictions(true);
            }}
            className="pl-10"
          />
          {showPredictions && predictions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
              {predictions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePredictionClick(prediction)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{prediction.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {loading && (
            <div className="absolute right-3 top-2.5">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button type="submit" className="bg-primary">
          Search
        </Button>
      </form>
    </Card>
  );
}
