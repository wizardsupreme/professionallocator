import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Globe, Mail, Clock, X } from "lucide-react";
import { SiWhatsapp } from 'react-icons/si';
import type { Business } from "../hooks/use-search";
import { MapView } from "./MapView";
import { useState } from 'react';


interface BusinessDetailsProps {
  business: Business | undefined;
  onClose: () => void;
}

export function BusinessDetails({ business, onClose }: BusinessDetailsProps) {
  const [reviewsToShow, setReviewsToShow] = useState(5);
  
  if (!business) return null;

  const showMoreReviews = () => {
    setReviewsToShow(prev => prev + 5);
  };

  const hasMoreReviews = business.reviewsList && reviewsToShow < business.reviewsList.length;

  return (
    <Dialog open={!!business} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{business.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{business.rating}</span>
              </div>
              <span>·</span>
              <span>{business.reviews} reviews</span>
            </div>
          </div>
          <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            {/* Removed duplicate close button */}

        </div>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
            <TabsTrigger value="map" className="flex-1">Map</TabsTrigger>
            <TabsTrigger value="contact" className="flex-1">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4">
            <div className="space-y-4">
              {business.photos && business.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {business.photos.slice(0, 4).map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${business.name} - Photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              <p className="text-muted-foreground">
                A professional {business.name.toLowerCase()} providing quality services in the area.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-bold">{business.rating}</div>
                <div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(business.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Based on {business.reviews} reviews
                  </div>
                </div>
              </div>

              <div className="divide-y">
                {business.reviewsList?.slice(0, reviewsToShow).map((review, index) => ( 
                  <div key={index} className="py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(review.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.time).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm mb-1 font-medium">{review.author_name}</p>
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
              {hasMoreReviews && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={showMoreReviews}
                >
                  Load More Reviews
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <div className="h-[400px] rounded-lg overflow-hidden">
              <MapView
                businesses={[business]}
                selectedBusiness={business}
                onMarkerClick={() => {}}
              />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Address</div>
                  <div className="text-muted-foreground">{business.address}</div>
                </div>
              </div>

              {business.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${business.phone.replace(/\s+/g, '')}`}
                        className="text-primary hover:underline"
                      >
                        {business.phone}
                      </a>
                      {business.phone && business.phone.match(/^\+?351/) && (
                        <a
                          href={`https://wa.me/${business.phone.replace(/[^\d+]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        >
                          <SiWhatsapp className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Business Hours</div>
                  <div className="text-muted-foreground">Contact for hours</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}