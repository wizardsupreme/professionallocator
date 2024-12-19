import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, Phone, MapPin } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { Business } from '../hooks/use-search';

interface BusinessCardProps {
  business: Business;
  onClick: () => void;
}

export function BusinessCard({ business, onClick }: BusinessCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg group"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold transition-colors duration-300 group-hover:text-primary">
              {business.name}
            </h3>
            <div className="flex items-center gap-1 text-yellow-500 mt-1">
              {Array.from({ length: Math.round(business.rating) }).map((_, i) => (
                <Star 
                  key={i} 
                  className="h-3 w-3 fill-current transition-transform duration-300 group-hover:scale-110" 
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1 transition-opacity duration-300 group-hover:opacity-80">
                ({business.reviews} reviews)
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1 justify-end group-hover:text-primary/80 transition-colors duration-300">
              <MapPin className="h-3 w-3 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xs">{business.address}</span>
            </div>
            <div className="flex items-center gap-2 justify-end mt-1">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 transition-transform duration-300 group-hover:scale-110" />
                <a 
                  href={`tel:${business.phone.replace(/\s+/g, '')}`}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  {business.phone}
                </a>
              </div>
              {business.phone && business.phone.match(/^\+?351/) && (
                <a
                  href={`https://wa.me/${business.phone.replace(/[^\d+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SiWhatsapp className="h-2.5 w-2.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
