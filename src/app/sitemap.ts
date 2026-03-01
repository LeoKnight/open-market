import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://open-market-sg.vercel.app";

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
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];

  try {
    const [listings, sellers] = await Promise.all([
      prisma.listing.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.user.findMany({
        where: { listings: { some: { status: "ACTIVE" } } },
        select: { id: true },
      }),
    ]);

    const listingEntries: MetadataRoute.Sitemap = listings.map((listing: { id: string; updatedAt: Date }) => ({
      url: `${SITE_URL}/listings/${listing.id}`,
      lastModified: listing.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const sellerEntries: MetadataRoute.Sitemap = sellers.map((seller: { id: string }) => ({
      url: `${SITE_URL}/seller/${seller.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    dynamicEntries = [...listingEntries, ...sellerEntries];
  } catch (error) {
    console.error("Sitemap: failed to fetch dynamic entries", error);
  }

  return [...staticEntries, ...dynamicEntries];
}
