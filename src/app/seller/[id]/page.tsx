import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import { User, MapPin, Calendar, Store, Bike, Eye } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const seller = await prisma.user.findUnique({
    where: { id },
    select: { name: true, isDealer: true, shopName: true },
  });
  if (!seller) return { title: "Seller Not Found" };

  const name = seller.shopName || seller.name || "Seller";
  const title = seller.isDealer ? `${name} - Verified Dealer` : name;
  const description = `View ${name}'s motorcycle listings on Open Market Singapore.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
  };
}

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Seller");

  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      isDealer: true,
      shopName: true,
      shopAddress: true,
      whatsapp: true,
      createdAt: true,
    },
  });

  if (!seller) notFound();

  const listings = await prisma.listing.findMany({
    where: { userId: id, status: "ACTIVE" },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  const stats = await prisma.listing.aggregate({
    where: { userId: id },
    _count: true,
    _sum: { views: true },
  });

  const soldCount = await prisma.listing.count({
    where: { userId: id, status: "SOLD" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              {seller.image ? (
                <img src={seller.image} alt={seller.name || ""} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {seller.shopName || seller.name || t("anonymous")}
                </h1>
                {seller.isDealer && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    <Store className="w-3 h-3" />
                    {t("verifiedDealer")}
                  </span>
                )}
              </div>
              {seller.shopAddress && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {seller.shopAddress}
                </p>
              )}
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {t("memberSince")} {new Date(seller.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
              </p>
              {seller.bio && (
                <p className="text-sm text-gray-600 mt-3">{seller.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                <Bike className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats._count}</p>
              <p className="text-xs text-gray-500">{t("totalListings")}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                <Eye className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{(stats._sum.views || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{t("totalViews")}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-green-500 mb-1">
                <Bike className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{soldCount}</p>
              <p className="text-xs text-gray-500">{t("sold")}</p>
            </div>
          </div>
        </div>

        {/* Listings */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {t("activeListings")} ({listings.length})
        </h2>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Bike className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t("noListings")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
