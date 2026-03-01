import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import SearchFilters from "@/components/SearchFilters";
import Link from "next/link";
import { Bike, ShieldCheck, DollarSign, Headphones, GitCompareArrows, Loader2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SearchParams {
  brand?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  minEngine?: string;
  maxEngine?: string;
  search?: string;
  licenseClass?: string;
  sort?: string;
  page?: string;
}

async function HomeContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await connection();
  const params = await searchParams;
  const t = await getTranslations("Home");
  const tc = await getTranslations("Common");
  const page = parseInt(params.page || "1");
  const limit = 12;

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (params.brand && params.brand !== "all") where.brand = params.brand;
  if (params.type && params.type !== "all") where.type = params.type;
  if (params.licenseClass && params.licenseClass !== "all") where.licenseClass = params.licenseClass;

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) (where.price as Record<string, number>).gte = parseFloat(params.minPrice);
    if (params.maxPrice) (where.price as Record<string, number>).lte = parseFloat(params.maxPrice);
  }

  if (params.minEngine || params.maxEngine) {
    where.engineSize = {};
    if (params.minEngine) (where.engineSize as Record<string, number>).gte = parseInt(params.minEngine);
    if (params.maxEngine) (where.engineSize as Record<string, number>).lte = parseInt(params.maxEngine);
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { brand: { contains: params.search, mode: "insensitive" } },
      { model: { contains: params.search, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (params.sort === "price_asc") orderBy = { price: "asc" };
  else if (params.sort === "price_desc") orderBy = { price: "desc" };
  else if (params.sort === "mileage_asc") orderBy = { mileage: "asc" };
  else if (params.sort === "views_desc") orderBy = { views: "desc" };

  const [listings, total, brands] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy,
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
  const hasFilters = params.brand || params.type || params.minPrice || params.maxPrice || params.search || params.licenseClass;

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {t("heroTitle")}
              <span className="text-yellow-400">{t("heroTitleHighlight")}</span>
            </h2>
            <p className="text-lg sm:text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
              {t("heroSubtitle")}
            </p>
            <SearchFilters brands={brands.map((b) => b.brand)} currentFilters={params} />
          </div>
        </div>
      </section>

      {/* Brands */}
      {!hasFilters && brands.length > 0 && (
        <section className="py-12 bg-background border-b border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">{t("popularBrands")}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {brands.map((b) => (
                <Badge key={b.brand} variant="secondary" asChild>
                  <Link href={`/?brand=${encodeURIComponent(b.brand)}`}
                    className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors">
                    {b.brand}
                  </Link>
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {hasFilters ? t("searchResults") : t("latestListings")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{t("motorcyclesFound", { count: total })}</p>
            </div>
            <div className="flex items-center gap-3">
              {hasFilters && (
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">{t("clearFilters")}</Link>
              )}
              <Link href="/compare" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                <GitCompareArrows className="w-4 h-4" />
                {t("compare") || "Compare"}
              </Link>
            </div>
          </div>

          {listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  {page > 1 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}>
                        {tc("previous")}
                      </Link>
                    </Button>
                  )}
                  <span className="px-4 py-2 text-sm text-muted-foreground">{t("pageOf", { page, totalPages })}</span>
                  {page < totalPages && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}>
                        {tc("next")}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Bike className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-xl font-medium text-muted-foreground mb-2">{t("noMotorcyclesFound")}</h4>
              <p className="text-muted-foreground mb-6">{hasFilters ? t("adjustFilters") : t("beFirstToList")}</p>
              <Button asChild>
                <Link href="/listings/new">{t("postMotorcycle")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background border-t border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center text-foreground mb-12">{t("whyChoose")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: t("verifiedListings"), desc: t("verifiedListingsDesc"), color: "bg-primary/10 text-primary" },
              { icon: DollarSign, title: t("transparentPricing"), desc: t("transparentPricingDesc"), color: "bg-green-500/10 text-green-600" },
              { icon: Bike, title: t("wideSelection"), desc: t("wideSelectionDesc"), color: "bg-purple-500/10 text-purple-600" },
              { icon: Headphones, title: t("support"), desc: t("supportDesc"), color: "bg-yellow-500/10 text-yellow-600" },
            ].map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="text-lg font-bold mb-4">{tc("appName")}</h5>
              <p className="text-muted-foreground text-sm">{t("footerDesc")}</p>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">{t("quickLinks")}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-background transition-colors">{t("browseMotorcycles")}</Link></li>
                <li><Link href="/listings/new" className="hover:text-background transition-colors">{t("sellYourMotorcycle")}</Link></li>
                <li><Link href="/compare" className="hover:text-background transition-colors">{t("compare") || "Compare Motorcycles"}</Link></li>
                <li><Link href="/depreciation-calculator" className="hover:text-background transition-colors">{t("depreciationCalculator")}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">{t("tools")}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/motorcycle-cost-calculator" className="hover:text-background transition-colors">{t("costCalculator")}</Link></li>
                <li><Link href="/power-to-weight" className="hover:text-background transition-colors">{t("powerToWeight")}</Link></li>
                <li><Link href="/fuel-consumption" className="hover:text-background transition-colors">{t("fuelConverter")}</Link></li>
                <li><Link href="/coe-trends" className="hover:text-background transition-colors">{t("coeTrends")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>{tc("allRightsReserved", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}
