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

interface Profession {
  name: string;
  category: string;
}

const PROFESSIONS: Profession[] = [
  { name: "Electrician", category: "Construction & Maintenance" },
  { name: "Plumber", category: "Construction & Maintenance" },
  { name: "Carpenter", category: "Construction & Maintenance" },
  { name: "Lawyer", category: "Legal Services" },
  { name: "Accountant", category: "Financial Services" },
  { name: "Doctor", category: "Healthcare" },
  { name: "Dentist", category: "Healthcare" },
  { name: "Mechanic", category: "Automotive" },
  { name: "Web Developer", category: "Technology" },
  { name: "Graphic Designer", category: "Creative Services" }
];

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [professionSuggestions, setProfessionSuggestions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeInputField, setActiveInputField] = useState<'profession' | 'location'>('profession');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [professionSelected, setProfessionSelected] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showProfessions, setShowProfessions] = useState(false);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await loadMapsApi();
        const { AutocompleteService } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
        autocompleteService.current = new AutocompleteService();
      } catch (error) {
        console.error("Error loading Google Maps Places:", error);
      }
    };
    
    initAutocomplete();
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

  useEffect(() => {
    if (!query || professionSelected) {
      setProfessionSuggestions([]);
      setShowProfessions(false);
      return;
    }

    const filtered = PROFESSIONS.filter(profession =>
      profession.name.toLowerCase().includes(query.toLowerCase())
    );
    setProfessionSuggestions(filtered);
    setShowProfessions(filtered.length > 0);
  }, [query, professionSelected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showProfessions && !showPredictions) return;
    
    const suggestions = activeInputField === 'profession' ? professionSuggestions : predictions;
    const maxIndex = suggestions.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeInputField === 'profession') {
          if (selectedIndex >= 0) {
            const profession = professionSuggestions[selectedIndex];
            setQuery(profession.name);
            setShowProfessions(false);
            setProfessionSelected(true);
          }
          // Always move to location input when Enter is pressed in profession field
          setActiveInputField('location');
          const locationInput = document.querySelector('input[placeholder="Location"]') as HTMLInputElement;
          if (locationInput) {
            locationInput.focus();
            // Scroll the location input into view if needed
            locationInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          if (selectedIndex >= 0) {
            const prediction = predictions[selectedIndex];
            handlePredictionClick(prediction);
          }
          if (query && location) {
            handleSubmit(e as any);
          }
        }
        setSelectedIndex(-1);
        break;
      case 'Tab':
        if (e.shiftKey) {
          // Shift+Tab: Move focus backwards
          if (activeInputField === 'location') {
            e.preventDefault();
            setActiveInputField('profession');
            const professionInput = document.querySelector('input[placeholder="Search for businesses or services..."]') as HTMLInputElement;
            if (professionInput) professionInput.focus();
          }
        } else {
          // Tab: Move focus forward
          if (activeInputField === 'profession') {
            e.preventDefault();
            setActiveInputField('location');
            const locationInput = document.querySelector('input[placeholder="Location"]') as HTMLInputElement;
            if (locationInput) locationInput.focus();
          }
        }
        setShowProfessions(false);
        setShowPredictions(false);
        setSelectedIndex(-1);
        break;
      case 'Escape':
        setShowProfessions(false);
        setShowPredictions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPredictions(false);
    setShowProfessions(false);
    onSearch(query, location);
  };

  const handlePredictionClick = (prediction: PlacePrediction) => {
    setLocation(prediction.description);
    setPredictions([]);
    setShowPredictions(false);
    setSelectedIndex(-1);
  };

  const handleProfessionClick = (profession: Profession) => {
    setQuery(profession.name);
    setProfessionSuggestions([]);
    setShowProfessions(false);
    setSelectedIndex(-1);
    setProfessionSelected(true);
    setActiveInputField('location');
    // Focus on location input after selecting profession
    setTimeout(() => {
      const locationInput = document.querySelector('input[placeholder="Location"]') as HTMLInputElement;
      if (locationInput) {
        locationInput.focus();
        locationInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  return (
    <Card className="p-4 shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for businesses or services..."
            value={query}
            onChange={(e) => {
              const newValue = e.target.value;
              setQuery(newValue);
              if (newValue === '') {
                setProfessionSelected(false);
                setShowProfessions(false);
              } else if (!professionSelected) {
                setShowProfessions(true);
              }
            }}
            onFocus={() => {
              setActiveInputField('profession');
              // Only show professions if we haven't selected one and have a query
              if (!professionSelected && query.length > 0) {
                setShowProfessions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
          {showProfessions && professionSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
              {professionSuggestions.map((profession, index) => (
                <div
                  key={profession.name}
                  className={`px-4 py-2 cursor-pointer ${
                    index === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleProfessionClick(profession)}
                >
                  <div className="flex items-center gap-2">
                    <span>{profession.name}</span>
                    <span className="text-sm text-muted-foreground">({profession.category})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 relative">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowPredictions(true);
              }}
              onFocus={() => {
                setActiveInputField('location');
                setShowPredictions(true);
              }}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-24"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
              onClick={async () => {
                if (!navigator.geolocation) {
                  alert("Geolocation is not supported by your browser");
                  return;
                }

                try {
                  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                  });

                  const { latitude, longitude } = position.coords;
                  const geocoder = new google.maps.Geocoder();
                  const response = await geocoder.geocode({
                    location: { lat: latitude, lng: longitude }
                  });

                  if (response.results[0]) {
                    setLocation(response.results[0].formatted_address);
                    setShowPredictions(false);
                  }
                } catch (error) {
                  console.error('Error getting location:', error);
                  alert("Failed to get your location. Please enter it manually.");
                }
              }}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Near Me
            </Button>
          </div>
          {showPredictions && predictions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
              {predictions.map((prediction, index) => (
                <div
                  key={prediction.place_id}
                  className={`px-4 py-2 cursor-pointer ${
                    index === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                  }`}
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