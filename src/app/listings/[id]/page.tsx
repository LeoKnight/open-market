import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import ImageGallery from "@/components/ImageGallery";
import {
  Calendar,
  Gauge,
  Fuel,
  MapPin,
  User,
  ArrowLeft,
  Pencil,
  Bike,
} from "lucide-react";

const conditionLabels: Record<string, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

const typeLabels: Record<string, string> = {
  SPORT: "Sport",
  TOURING: "Touring",
  CRUISER: "Cruiser",
  SPORT_TOURING: "Sport Touring",
  ADVENTURE: "Adventure",
  NAKED: "Naked",
  SCOOTER: "Scooter",
  OTHER: "Other",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, image: true, createdAt: true },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const session = await auth();
  const isOwner = session?.user?.id === listing.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={listing.images} title={listing.title} />

            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bike className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Brand</p>
                    <p className="text-sm font-medium text-gray-900">
                      {listing.brand}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bike className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Model</p>
                    <p className="text-sm font-medium text-gray-900">
                      {listing.model}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Year</p>
                    <p className="text-sm font-medium text-gray-900">
                      {listing.year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Gauge className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Mileage</p>
                    <p className="text-sm font-medium text-gray-900">
                      {listing.mileage.toLocaleString()} km
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Fuel className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Engine</p>
                    <p className="text-sm font-medium text-gray-900">
                      {listing.engineSize}cc
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bike className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {typeLabels[listing.type] || listing.type}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: Price + Seller Info */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {listing.title}
                </h1>
                {isOwner && (
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {listing.status === "SOLD" && (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full mb-3">
                  Sold
                </span>
              )}

              <p className="text-3xl font-bold text-blue-600 mb-1">
                ${listing.price.toLocaleString()}
              </p>

              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{listing.location}</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
                <span>
                  Condition:{" "}
                  <span className="font-medium text-gray-700">
                    {conditionLabels[listing.condition] || listing.condition}
                  </span>
                </span>
              </div>

              <div className="text-xs text-gray-400">
                Listed on{" "}
                {new Date(listing.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seller
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {listing.user.image ? (
                    <img
                      src={listing.user.image}
                      alt={listing.user.name || "Seller"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {listing.user.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Member since{" "}
                    {new Date(listing.user.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
