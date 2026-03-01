import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import DashboardActions from "@/components/DashboardActions";
import ListingCard from "@/components/ListingCard";
import { DashboardTabs } from "@/components/DashboardTabs";
import { Plus, Bike, Fuel, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardParams {
  tab?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardParams>;
}) {
  const params = await searchParams;
  const t = await getTranslations("Dashboard");
  const session = await auth();

  if (!session?.user) redirect("/auth/signin");

  const tab = params.tab || "listings";

  const listings = await prisma.listing.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const favorites = tab === "favorites"
    ? await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: {
          listing: {
            include: { user: { select: { id: true, name: true, image: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
  const soldCount = listings.filter((l) => l.status === "SOLD").length;

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <Button asChild>
            <Link href="/listings/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t("newListing")}
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{t("total")}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{listings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{t("active")}</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{t("sold")}</p>
              <p className="text-2xl font-bold text-primary mt-1">{soldCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <DashboardTabs
          currentTab={tab}
          listingsLabel={t("title")}
          favoritesLabel={t("favorites")}
        />

        {/* Tab Content */}
        {tab === "favorites" ? (
          favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((fav) => (
                <ListingCard key={fav.id} listing={fav.listing} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-20">
              <CardContent className="pt-6">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">{t("noFavorites")}</h3>
                <p className="text-muted-foreground mb-6">{t("favoritesHint")}</p>
                <Button asChild>
                  <Link href="/">{t("active")}</Link>
                </Button>
              </CardContent>
            </Card>
          )
        ) : listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="p-4 sm:p-5">
                <CardContent className="p-0 flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-40 h-32 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {listing.images.length > 0 ? (
                      <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="160px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Fuel className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    {listing.status === "SOLD" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive" className="text-sm font-bold">SOLD</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/listings/${listing.id}`}
                          className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                          {listing.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {listing.brand} {listing.model} &middot; {listing.year} &middot; {listing.engineSize}cc &middot; {listing.mileage.toLocaleString()} km
                        </p>
                      </div>
                      <p className="text-xl font-bold text-primary whitespace-nowrap">
                        S${listing.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge
                        variant={
                          listing.status === "ACTIVE" ? "default" :
                          listing.status === "SOLD" ? "secondary" : "destructive"
                        }
                      >
                        {listing.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {t("listedOn", { date: new Date(listing.createdAt).toLocaleDateString() })}
                      </span>
                      <span className="text-xs text-muted-foreground">&middot; {listing.views} views</span>
                    </div>

                    <DashboardActions listingId={listing.id} currentStatus={listing.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-20">
            <CardContent className="pt-6">
              <Bike className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">{t("noListings")}</h3>
              <p className="text-muted-foreground mb-6">{t("startSelling")}</p>
              <Button asChild>
                <Link href="/listings/new" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t("createListing")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
