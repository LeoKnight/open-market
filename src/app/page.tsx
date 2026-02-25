import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import SearchFilters from "@/components/SearchFilters";
import Link from "next/link";
import { Bike, ShieldCheck, DollarSign, Headphones } from "lucide-react";

interface SearchParams {
  brand?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  minEngine?: string;
  maxEngine?: string;
  search?: string;
  page?: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 12;

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (params.brand && params.brand !== "all") {
    where.brand = params.brand;
  }

  if (params.type && params.type !== "all") {
    where.type = params.type;
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice)
      (where.price as Record<string, number>).gte = parseFloat(
        params.minPrice
      );
    if (params.maxPrice)
      (where.price as Record<string, number>).lte = parseFloat(
        params.maxPrice
      );
  }

  if (params.minEngine || params.maxEngine) {
    where.engineSize = {};
    if (params.minEngine)
      (where.engineSize as Record<string, number>).gte = parseInt(
        params.minEngine
      );
    if (params.maxEngine)
      (where.engineSize as Record<string, number>).lte = parseInt(
        params.maxEngine
      );
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { brand: { contains: params.search, mode: "insensitive" } },
      { model: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [listings, total, brands] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasFilters =
    params.brand || params.type || params.minPrice || params.maxPrice || params.search;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Find Your{" "}
              <span className="text-yellow-400">Perfect Motorcycle</span>
            </h2>
            <p className="text-lg sm:text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
              Browse quality used motorcycles from trusted sellers. Transparent
              pricing, verified listings.
            </p>

            <SearchFilters
              brands={brands.map((b) => b.brand)}
              currentFilters={params}
            />
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      {!hasFilters && brands.length > 0 && (
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Popular Brands
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {brands.map((b) => (
                <Link
                  key={b.brand}
                  href={`/?brand=${encodeURIComponent(b.brand)}`}
                  className="px-5 py-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-full text-sm font-medium text-gray-700 transition-colors border border-gray-200 hover:border-blue-200"
                >
                  {b.brand}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Motorcycle Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {hasFilters ? "Search Results" : "Latest Listings"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {total} motorcycle{total !== 1 ? "s" : ""} found
              </p>
            </div>
            {hasFilters && (
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </Link>
            )}
          </div>

          {listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  {page > 1 && (
                    <Link
                      href={`/?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="px-4 py-2 text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`/?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-medium text-gray-600 mb-2">
                No motorcycles found
              </h4>
              <p className="text-gray-400 mb-6">
                {hasFilters
                  ? "Try adjusting your search filters"
                  : "Be the first to list a motorcycle!"}
              </p>
              <Link
                href="/listings/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Post a Motorcycle
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Why Choose Open Market
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Listings",
                desc: "All listings are from verified users for your peace of mind",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: DollarSign,
                title: "Transparent Pricing",
                desc: "Clear pricing with no hidden fees or surprises",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Bike,
                title: "Wide Selection",
                desc: "From scooters to superbikes, find every type of motorcycle",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: Headphones,
                title: "Support",
                desc: "Dedicated support to help with buying and selling",
                color: "bg-yellow-100 text-yellow-600",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div
                  className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="text-lg font-bold mb-4">Open Market</h5>
              <p className="text-gray-400 text-sm">
                Professional used motorcycle trading platform. Buy and sell with
                confidence.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Browse Motorcycles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/listings/new"
                    className="hover:text-white transition-colors"
                  >
                    Sell Your Motorcycle
                  </Link>
                </li>
                <li>
                  <Link
                    href="/depreciation-calculator"
                    className="hover:text-white transition-colors"
                  >
                    Depreciation Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/coe-trends"
                    className="hover:text-white transition-colors"
                  >
                    COE Trends
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Tools</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/motorcycle-cost-calculator"
                    className="hover:text-white transition-colors"
                  >
                    Cost Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/power-to-weight"
                    className="hover:text-white transition-colors"
                  >
                    Power-to-Weight
                  </Link>
                </li>
                <li>
                  <Link
                    href="/fuel-consumption"
                    className="hover:text-white transition-colors"
                  >
                    Fuel Converter
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Open Market. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
