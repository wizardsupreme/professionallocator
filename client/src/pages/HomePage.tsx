import { useState, useMemo } from 'react';
import { UserCircle, LogOut, Loader2 } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { BusinessCard } from '../components/BusinessCard';
import { MapView } from '../components/MapView';
import { Pagination } from '../components/Pagination';
import { useSearch, type Business } from '../hooks/use-search';
import { useUser } from '../hooks/use-user';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [searchParams, setSearchParams] = useState({ query: '', location: '' });
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedBusiness, setSelectedBusiness] = useState<Business>();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: businesses, isLoading } = useSearch(searchParams);
  const { user, logout } = useUser();

  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.ceil((businesses?.length || 0) / ITEMS_PER_PAGE);

  const paginatedBusinesses = useMemo(() => {
    if (!businesses) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return businesses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [businesses, currentPage]);

  const handleSearch = (query: string, location: string) => {
    setSearchParams({ query, location });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-auto">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">BusinessFinder</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  <UserCircle className="inline-block mr-2 h-5 w-5" />
                  {user.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/auth'}
              >
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className={`px-4 py-8 ${!businesses?.length ? 'flex-1 flex items-center justify-center' : ''}`}>
          <div className="w-full max-w-3xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {businesses && businesses.length > 0 && (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setView('list')}
                    className={`${
                      view === 'list'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setView('map')}
                    className={`${
                      view === 'map'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Map View
                  </button>
                </nav>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            ) : view === 'list' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2">
                  {paginatedBusinesses.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      onClick={() => setSelectedBusiness(business)}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            ) : (
              <div className="h-[600px]">
                {businesses && (
                  <MapView
                    businesses={businesses}
                    selectedBusiness={selectedBusiness}
                    onMarkerClick={setSelectedBusiness}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
