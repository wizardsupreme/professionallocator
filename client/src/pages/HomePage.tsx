import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { BusinessCard } from '../components/BusinessCard';
import { MapView } from '../components/MapView';
import { useSearch, type Business } from '../hooks/use-search';
import { useUser } from '../hooks/use-user';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut } from 'lucide-react';

export default function HomePage() {
  const [searchParams, setSearchParams] = useState({ query: '', location: '' });
  const [selectedBusiness, setSelectedBusiness] = useState<Business>();
  const { data: businesses, isLoading } = useSearch(searchParams);
  const { user, logout } = useUser();

  const handleSearch = (query: string, location: string) => {
    setSearchParams({ query, location });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">BusinessFinder</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              <UserCircle className="inline-block mr-2 h-5 w-5" />
              {user?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {businesses?.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onClick={() => setSelectedBusiness(business)}
                />
              ))}
            </div>
            <div className="lg:sticky lg:top-8 h-[calc(100vh-200px)]">
              {businesses && (
                <MapView
                  businesses={businesses}
                  selectedBusiness={selectedBusiness}
                  onMarkerClick={setSelectedBusiness}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
