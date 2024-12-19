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
              <div className="flex items-center gap-4">
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
                    <div className="text-muted-foreground">{business.phone}</div>
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
