import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, Phone, MapPin } from 'lucide-react';
import type { Business } from '../hooks/use-search';

interface BusinessCardProps {
  business: Business;
  onClick: () => void;
}

export function BusinessCard({ business, onClick }: BusinessCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{business.name}</h3>
            <div className="flex items-center gap-1 text-yellow-500 mt-1">
              {Array.from({ length: Math.round(business.rating) }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({business.reviews} reviews)
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1 justify-end">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="text-xs">{business.address}</span>
            </div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <Phone className="h-3 w-3" />
              <a 
                href={`tel:${business.phone}`}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {business.phone}
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
