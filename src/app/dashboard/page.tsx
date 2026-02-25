import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DashboardActions from "@/components/DashboardActions";
import {
  Plus,
  Bike,
  Fuel,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const listings = await prisma.listing.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
  const soldCount = listings.filter((l) => l.status === "SOLD").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your motorcycle listings
            </p>
          </div>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {listings.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {activeCount}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Sold</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {soldCount}
            </p>
          </div>
        </div>

        {/* Listings */}
        {listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
              >
                {/* Image */}
                <div className="relative w-full sm:w-40 h-32 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Fuel className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  {listing.status === "SOLD" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">SOLD</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {listing.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {listing.brand} {listing.model} &middot; {listing.year}{" "}
                        &middot; {listing.engineSize}cc &middot;{" "}
                        {listing.mileage.toLocaleString()} km
                      </p>
                    </div>
                    <p className="text-xl font-bold text-blue-600 whitespace-nowrap">
                      ${listing.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        listing.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : listing.status === "SOLD"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {listing.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      Listed on{" "}
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <DashboardActions
                    listingId={listing.id}
                    currentStatus={listing.status}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No listings yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start selling by creating your first listing
            </p>
            <Link
              href="/listings/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
