import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Gauge, Fuel } from "lucide-react";

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
    user: {
      name: string | null;
    };
  };
}

const conditionLabels: Record<string, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

const conditionColors: Record<string, string> = {
  EXCELLENT: "bg-green-100 text-green-800",
  GOOD: "bg-blue-100 text-blue-800",
  FAIR: "bg-yellow-100 text-yellow-800",
  POOR: "bg-red-100 text-red-800",
};

export default function ListingCard({ listing }: ListingCardProps) {
  const hasImage = listing.images.length > 0;

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {hasImage ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <Fuel className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {listing.status === "SOLD" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-2xl font-bold rotate-[-15deg] border-4 border-white px-6 py-2">
                SOLD
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                conditionColors[listing.condition] || conditionColors.GOOD
              }`}
            >
              {conditionLabels[listing.condition] || listing.condition}
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {listing.title}
            </h3>
          </div>

          <p className="text-2xl font-bold text-blue-600 mb-3">
            ${listing.price.toLocaleString()}
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-auto">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{listing.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" />
              <span>{listing.mileage.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5" />
              <span>{listing.engineSize}cc</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{listing.location}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
