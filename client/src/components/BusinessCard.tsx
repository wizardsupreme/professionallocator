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
      <CardHeader className="p-4">
        <h3 className="text-lg font-semibold">{business.name}</h3>
        <div className="flex items-center gap-1 text-yellow-500">
          {Array.from({ length: Math.round(business.rating) }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
          <span className="text-sm text-muted-foreground ml-1">
            ({business.reviews} reviews)
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-1 shrink-0" />
          <span>{business.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Phone className="h-4 w-4" />
          <span>{business.phone}</span>
        </div>
      </CardContent>
    </Card>
  );
}
