import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, location);
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
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" className="bg-primary">
          Search
        </Button>
      </form>
    </Card>
  );
}
