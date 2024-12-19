import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Globe, Mail, Clock, X } from "lucide-react";
import type { Business } from "../hooks/use-search";
import { MapView } from "./MapView";

interface BusinessDetailsProps {
  business: Business | undefined;
  onClose: () => void;
}

export function BusinessDetails({ business, onClose }: BusinessDetailsProps) {
  if (!business) return null;

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
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
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
                {business.reviewsList?.map((review, index) => (
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
                      {business.phone.includes('351') && (
                        <a
                          href={`https://wa.me/${business.phone.replace(/\s+/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-500 text-white rounded-full hover:bg-green-600"
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          WhatsApp
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
