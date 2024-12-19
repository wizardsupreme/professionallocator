import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Loader2, History, Star } from 'lucide-react';
import { loadMapsApi } from '../lib/maps';
import { useSearchHistory } from '../hooks/use-search-history';
import { useUser } from '../hooks/use-user';

interface SearchBarProps {
  onSearch: (query: string, location: string, coordinates?: google.maps.LatLngLiteral) => void;
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
  { name: "Massage Therapist", category: "Healthcare & Wellness" },
  { name: "Physical Therapist", category: "Healthcare & Wellness" },
  { name: "Chiropractor", category: "Healthcare & Wellness" },
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
  const [locationSelected, setLocationSelected] = useState(false);
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

  const { getProfessionSuggestions, getLocationSuggestions } = useSearchHistory();
  const { user } = useUser();

  useEffect(() => {
    if (locationSelected) return;
    
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        if (location && autocompleteService.current) {
          const response = await autocompleteService.current?.getPlacePredictions({
            input: location,
            types: ['(cities)']
          });
          setPredictions(response?.predictions || []);
        } else {
          setPredictions([]);
        }
        
        // Only show predictions/history if we're still focused (activeInputField === 'location')
        // and either:
        // 1. We have some history to show (user is logged in), or
        // 2. We have a location query to show predictions for
        if (activeInputField === 'location' && (user || location)) {
          setShowPredictions(true);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timeoutId);
  }, [location, locationSelected, user, activeInputField]);

  useEffect(() => {
    if (professionSelected) {
      setProfessionSuggestions([]);
      setShowProfessions(false);
      return;
    }

    let suggestions: Array<{ name: string; category: string; isHistory?: boolean }> = [];

    // Get history suggestions first if user is logged in
    if (user) {
      const historySuggestions = getProfessionSuggestions(query || '');
      suggestions.push(
        ...historySuggestions.map(suggestion => ({
          name: suggestion,
          category: 'Recent Searches',
          isHistory: true
        }))
      );
    }

    // Add filtered professions if there's a query
    if (query) {
      const filtered = PROFESSIONS.filter(profession =>
        profession.name.toLowerCase().includes(query.toLowerCase())
      );
      suggestions.push(
        ...filtered.map(profession => ({
          ...profession,
          isHistory: false
        }))
      );
    } else if (!suggestions.length) {
      // If no query and no history, show all professions
      suggestions = PROFESSIONS.map(profession => ({
        ...profession,
        isHistory: false
      }));
    }

    // Remove duplicates
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(item => [item.name, item])).values()
    );

    setProfessionSuggestions(uniqueSuggestions);
    setShowProfessions(uniqueSuggestions.length > 0);
  }, [query, professionSelected, user]);

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
    setLocationSelected(true);
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
              // Show professions suggestions if not selected (including recent searches)
              if (!professionSelected) {
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
                    {profession.isHistory ? (
                      <History className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Star className="h-4 w-4 text-muted-foreground" />
                    )}
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
                const newValue = e.target.value;
                setLocation(newValue);
                if (newValue === '') {
                  setLocationSelected(false);
                  setShowPredictions(false);
                } else if (!locationSelected) {
                  setShowPredictions(true);
                }
              }}
              onFocus={() => {
                setActiveInputField('location');
                // Show predictions/history immediately on focus if not already selected
                if (!locationSelected) {
                  setShowPredictions(true);
                  // Force a re-render with empty predictions to show history
                  setPredictions([]);
                }
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
                    const result = response.results[0];
                    setLocation(result.formatted_address);
                    setShowPredictions(false);
                    setLocationSelected(true);
                    onSearch(query, result.formatted_address, {
                      lat: latitude,
                      lng: longitude
                    });
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
          {showPredictions && (predictions.length > 0 || (user && getLocationSuggestions(location).length > 0)) && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
              {/* Show history suggestions first */}
              {user && getLocationSuggestions(location).map((historicLocation, index) => (
                <div
                  key={`history-${historicLocation}`}
                  className={`px-4 py-2 cursor-pointer ${
                    index === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setLocation(historicLocation);
                    setShowPredictions(false);
                    setLocationSelected(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span>{historicLocation}</span>
                    <span className="text-sm text-muted-foreground">(Recent)</span>
                  </div>
                </div>
              ))}
              
              {/* Show Google Places predictions */}
              {predictions.map((prediction, index) => (
                <div
                  key={prediction.place_id}
                  className={`px-4 py-2 cursor-pointer ${
                    index === selectedIndex + (user ? getLocationSuggestions(location).length : 0) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-gray-100'
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