import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://open-market-sg.vercel.app";
const LOCALES = ["en", "zh", "fr", "es", "ja", "ko"] as const;

function localeAlternates(path: string) {
  return Object.fromEntries(
    LOCALES.map((loc) => [loc, `${SITE_URL}${path}?locale=${loc}`])
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/compare",
    "/coe-trends",
    "/depreciation-calculator",
    "/fuel-consumption",
    "/motorcycle-cost-calculator",
    "/power-to-weight",
    "/recommend",
    "/regulations",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : 0.7,
    alternates: { languages: localeAlternates(path) },
  }));

  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const listingEntries: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${SITE_URL}/listings/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
    alternates: {
      languages: localeAlternates(`/listings/${listing.id}`),
    },
  }));

  const sellers = await prisma.user.findMany({
    where: { listings: { some: { status: "ACTIVE" } } },
    select: { id: true },
  });

  const sellerEntries: MetadataRoute.Sitemap = sellers.map((seller) => ({
    url: `${SITE_URL}/seller/${seller.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
    alternates: { languages: localeAlternates(`/seller/${seller.id}`) },
  }));

  return [...staticEntries, ...listingEntries, ...sellerEntries];
}
