import Link from "next/link";
import Image from "next/image";
import { Calendar, Gauge, Fuel, Eye, ShieldCheck } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { normalizeImageUrl } from "@/lib/image-url";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    engineSize: number;
    mileage: number;
    price: number;
    location: string;
    images: string[];
    status: string;
    condition: string;
    views?: number;
    licenseClass?: string | null;
    coeExpiryDate?: string | Date | null;
    isVerified?: boolean;
    user: {
      name: string | null;
    };
  };
}

const conditionVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  EXCELLENT: "default",
  GOOD: "secondary",
  FAIR: "outline",
  POOR: "destructive",
};

const conditionLabels: Record<string, string> = {
  EXCELLENT: "Excellent", GOOD: "Good", FAIR: "Fair", POOR: "Poor",
};

const licenseLabels: Record<string, string> = {
  CLASS_2B: "2B", CLASS_2A: "2A", CLASS_2: "2",
};

function getCoeYearsRemaining(coeExpiryDate: string | Date | null | undefined): string | null {
  if (!coeExpiryDate) return null;
  const days = Math.max(0, Math.floor((new Date(coeExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  if (days === 0) return "Expired";
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return years > 0 ? `${years}Y${months}M` : `${months}M`;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const hasImage = listing.images.length > 0;
  const coeRemaining = getCoeYearsRemaining(listing.coeExpiryDate);

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {hasImage ? (
            <Image
              src={normalizeImageUrl(listing.images[0])}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Fuel className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {listing.status === "SOLD" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-2xl font-bold rotate-[-15deg] border-4 border-white px-6 py-2">
                SOLD
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <Badge variant={conditionVariant[listing.condition] || "secondary"}>
              {conditionLabels[listing.condition] || listing.condition}
            </Badge>
            {listing.licenseClass && (
              <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                {licenseLabels[listing.licenseClass]}
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <FavoriteButton listingId={listing.id} size="sm" />
          </div>

          {coeRemaining && (
            <div className="absolute bottom-3 left-3">
              <Badge variant={coeRemaining === "Expired" ? "destructive" : "secondary"} className="bg-black/60 text-white border-0">
                COE {coeRemaining}
              </Badge>
            </div>
          )}

          {listing.isVerified && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-green-500/90 text-white border-0">
                <ShieldCheck className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors mb-1">
            {listing.title}
          </h3>

          <p className="text-2xl font-bold text-primary mb-3">
            S${listing.price.toLocaleString()}
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-auto">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /><span>{listing.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" /><span>{listing.mileage.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5" /><span>{listing.engineSize}cc</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /><span>{listing.views || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
