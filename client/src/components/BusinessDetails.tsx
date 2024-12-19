import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Clock, Loader2 } from "lucide-react";
import { SiWhatsapp } from 'react-icons/si';
import type { Business } from "../hooks/use-search";
import { MapView } from "./MapView";
import { Pagination } from "./Pagination";
import { useState, useEffect } from 'react';


interface BusinessDetailsProps {
  business: Business | undefined;
  onClose: () => void;
}

export function BusinessDetails({ business, onClose }: BusinessDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    if (business?.reviewsList) {
      // Add a small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [business?.reviewsList]);

  if (!business) return null;

  const totalPages = business.reviewsList 
    ? Math.ceil(business.reviewsList.length / reviewsPerPage)
    : 1;

  const currentReviews = business.reviewsList
    ? business.reviewsList.slice(
        (currentPage - 1) * reviewsPerPage,
        currentPage * reviewsPerPage
      )
    : [];

  return (
    <Dialog open={!!business} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold">{business.name}</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{business.rating}</span>
            </div>
            <span>·</span>
            <span>{business.reviews} reviews</span>
          </div>
        </DialogHeader>

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

              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="divide-y">
                      {currentReviews.map((review, index) => (
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
                              {new Date(review.time * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mb-1 font-medium">{review.author_name}</p>
                          <p className="text-sm text-muted-foreground">{review.text}</p>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex justify-center pt-4">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
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