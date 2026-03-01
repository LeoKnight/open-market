import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import ImageGallery from "@/components/ImageGallery";
import PriceAnalysis from "@/components/PriceAnalysis";
import PerformanceCard from "@/components/PerformanceCard";
import COEInfoPanel from "@/components/COEInfoPanel";
import WhatsAppButton from "@/components/WhatsAppButton";
import FavoriteButton from "@/components/FavoriteButton";
import AddToCompare from "@/components/AddToCompare";
import AIListingConsult from "@/components/AIListingConsult";
import AIPricingAnalysis from "@/components/AIPricingAnalysis";
import AITotalCostAnalysis from "@/components/AITotalCostAnalysis";
import VerificationBadge from "@/components/VerificationBadge";
import { normalizeImageUrl } from "@/lib/image-url";
import {
  Calendar, Gauge, Fuel, MapPin, User, ArrowLeft, Pencil, Bike, Eye, Shield,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const conditionKeyMap: Record<string, string> = {
  EXCELLENT: "conditionExcellent", GOOD: "conditionGood", FAIR: "conditionFair", POOR: "conditionPoor",
};

const typeKeyMap: Record<string, string> = {
  SPORT: "typeSport", TOURING: "typeTouring", CRUISER: "typeCruiser", SPORT_TOURING: "typeSportTouring",
  ADVENTURE: "typeAdventure", NAKED: "typeNaked", SCOOTER: "typeScooter", OTHER: "typeOther",
};

const licenseClassLabels: Record<string, string> = {
  CLASS_2B: "Class 2B", CLASS_2A: "Class 2A", CLASS_2: "Class 2",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Listings");
  const td = await getTranslations("Dashboard");

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, image: true, createdAt: true, isDealer: true, shopName: true },
      },
    },
  });

  if (!listing) notFound();

  // Increment view count
  await prisma.listing.update({ where: { id }, data: { views: { increment: 1 } } });

  // Get market average for same brand+model
  const marketAvg = await prisma.listing.aggregate({
    where: { brand: listing.brand, model: listing.model, status: "ACTIVE", id: { not: listing.id } },
    _avg: { price: true },
    _count: true,
  });

  // Get current COE price
  let coePrice: number | null = null;
  try {
    const { getLatestCOEPrice } = await import("@/data/motorcycle-coe-data");
    coePrice = getLatestCOEPrice();
  } catch {
    coePrice = null;
  }

  const session = await auth();
  const isOwner = session?.user?.id === listing.userId;

  const marketAvgPrice = marketAvg._count >= 1 ? Math.round(marketAvg._avg.price || 0) : null;

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    {t("backToListings")}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-normal">{listing.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{listing.views} {t("views")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details + Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={listing.images} title={listing.title} />

            {/* Details Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("details")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <DetailItem icon={<Bike className="w-5 h-5 text-gray-400" />} label={t("brand")} value={listing.brand} />
                <DetailItem icon={<Bike className="w-5 h-5 text-gray-400" />} label={t("model")} value={listing.model} />
                <DetailItem icon={<Calendar className="w-5 h-5 text-gray-400" />} label={t("year")} value={String(listing.year)} />
                <DetailItem icon={<Gauge className="w-5 h-5 text-gray-400" />} label={t("mileage")} value={`${listing.mileage.toLocaleString()} km`} />
                <DetailItem icon={<Fuel className="w-5 h-5 text-gray-400" />} label={t("engine")} value={`${listing.engineSize}cc`} />
                <DetailItem icon={<Bike className="w-5 h-5 text-gray-400" />} label={t("type")}
                  value={typeKeyMap[listing.type] ? t(typeKeyMap[listing.type]) : listing.type} />
                {listing.licenseClass && (
                  <DetailItem icon={<Shield className="w-5 h-5 text-gray-400" />} label={t("licenseClass")}
                    value={licenseClassLabels[listing.licenseClass] || listing.licenseClass} />
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t("description")}</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Price Analysis */}
            <PriceAnalysis
              price={listing.price}
              omv={listing.omv}
              registrationDate={listing.registrationDate?.toISOString() || null}
              coeExpiryDate={listing.coeExpiryDate?.toISOString() || null}
              coePrice={coePrice}
              marketAvgPrice={marketAvgPrice}
            />

            {/* Performance Card */}
            <PerformanceCard
              power={listing.power}
              weight={listing.weight}
              torque={listing.torque}
              fuelConsumption={listing.fuelConsumption}
              engineSize={listing.engineSize}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-xl font-bold text-foreground flex-1">{listing.title}</h1>
                  <div className="flex items-center gap-1">
                    <FavoriteButton listingId={listing.id} />
                    {isOwner && (
                      <Link href={`/listings/${listing.id}/edit`} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {listing.status === "SOLD" && (
                  <Badge variant="destructive" className="mb-3">{td("sold")}</Badge>
                )}

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {listing.licenseClass && (
                    <Badge variant="secondary">{licenseClassLabels[listing.licenseClass]}</Badge>
                  )}
                  <VerificationBadge isVerified={listing.isVerified} size="sm" />
                </div>

                <p className="text-3xl font-bold text-primary mb-1">S${listing.price.toLocaleString()}</p>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                  <span>{t("condition")}{" "}
                    <span className="font-medium text-foreground">
                      {conditionKeyMap[listing.condition] ? t(conditionKeyMap[listing.condition]) : listing.condition}
                    </span>
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mb-4">
                  {td("listedOn", { date: new Date(listing.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) })}
                </div>

              {/* Action Buttons */}
              <div className="space-y-2 mb-4">
                <WhatsAppButton
                  whatsapp={listing.contactWhatsapp}
                  phone={listing.contactPhone}
                  title={listing.title}
                  price={listing.price}
                />
              </div>

              <AddToCompare listing={{
                id: listing.id,
                title: listing.title,
                brand: listing.brand,
                model: listing.model,
                price: listing.price,
                image: normalizeImageUrl(listing.images[0]),
              }} />

                <div className="mt-3">
                  <AIListingConsult
                  listing={{
                    title: listing.title,
                    brand: listing.brand,
                    model: listing.model,
                    year: listing.year,
                    engineSize: listing.engineSize,
                    mileage: listing.mileage,
                    price: listing.price,
                    condition: listing.condition,
                    type: listing.type,
                    power: listing.power,
                    weight: listing.weight,
                    torque: listing.torque,
                    fuelConsumption: listing.fuelConsumption,
                    coeExpiryDate: listing.coeExpiryDate?.toISOString() || null,
                    omv: listing.omv,
                    location: listing.location,
                    description: listing.description,
                    licenseClass: listing.licenseClass,
                  }}
                />
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t("seller")}</h3>
                <Link href={`/seller/${listing.user.id}`} className="flex items-center gap-3 mb-4 group">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.user.image || undefined} alt={listing.user.name || "Seller"} />
                    <AvatarFallback>
                      <User className="w-6 h-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {listing.user.shopName || listing.user.name || t("anonymous")}
                    </p>
                    {listing.user.isDealer && (
                      <Badge variant="secondary" className="text-xs">{t("verifiedDealer")}</Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t("memberSince", { date: new Date(listing.user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) })}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* AI Pricing Analysis */}
            <AIPricingAnalysis
              listing={{
                brand: listing.brand,
                model: listing.model,
                year: listing.year,
                engineSize: listing.engineSize,
                mileage: listing.mileage,
                price: listing.price,
                condition: listing.condition,
                coeExpiryDate: listing.coeExpiryDate?.toISOString(),
                omv: listing.omv ?? undefined,
              }}
            />

            {/* AI Total Cost Analysis */}
            <AITotalCostAnalysis
              bikeData={{
                brand: listing.brand,
                model: listing.model,
                year: listing.year,
                engineSize: listing.engineSize,
                price: listing.price,
                mileage: listing.mileage,
                coeExpiryDate: listing.coeExpiryDate?.toISOString(),
                omv: listing.omv ?? undefined,
                fuelConsumption: listing.fuelConsumption ?? undefined,
              }}
            />

            {/* COE Info */}
            <COEInfoPanel
              coeExpiryDate={listing.coeExpiryDate?.toISOString() || null}
              registrationDate={listing.registrationDate?.toISOString() || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
