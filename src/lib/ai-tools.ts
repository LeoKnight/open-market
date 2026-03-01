import { prisma } from "./prisma";
import {
  getLatestCOEPrice,
  getLatestPQP,
  getCOEStatistics,
} from "@/data/motorcycle-coe-data";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolResult {
  tool: string;
  result: unknown;
}

export const AI_TOOLS: ToolDefinition[] = [
  {
    name: "search_listings",
    description:
      "Search active motorcycle listings. Use when user asks about available bikes, specific models, or wants to find motorcycles.",
    parameters: {
      type: "object",
      properties: {
        brand: { type: "string", description: "Motorcycle brand" },
        minPrice: { type: "number", description: "Minimum price in SGD" },
        maxPrice: { type: "number", description: "Maximum price in SGD" },
        licenseClass: {
          type: "string",
          enum: ["CLASS_2B", "CLASS_2A", "CLASS_2"],
        },
        limit: { type: "number", description: "Max results (default 5)" },
      },
    },
  },
  {
    name: "get_coe_price",
    description:
      "Get latest motorcycle COE (Category D) price and PQP. Use when user asks about current COE prices.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "calculate_road_tax",
    description:
      "Calculate annual road tax based on engine displacement in cc.",
    parameters: {
      type: "object",
      properties: {
        engineSize: {
          type: "number",
          description: "Engine displacement in cc",
        },
      },
      required: ["engineSize"],
    },
  },
  {
    name: "calculate_depreciation",
    description:
      "Calculate motorcycle depreciation based on purchase price, COE expiry, and current date.",
    parameters: {
      type: "object",
      properties: {
        purchasePrice: { type: "number", description: "Purchase price in SGD" },
        coeExpiryDate: {
          type: "string",
          description: "COE expiry date (YYYY-MM-DD)",
        },
        currentDate: {
          type: "string",
          description: "Current date (YYYY-MM-DD), optional",
        },
      },
      required: ["purchasePrice", "coeExpiryDate"],
    },
  },
  {
    name: "get_coe_statistics",
    description:
      "Get comprehensive COE statistics including historical min, max, average, and recent trends.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "compare_bikes",
    description:
      "Compare two or more motorcycles by their listing IDs. Returns specs side by side.",
    parameters: {
      type: "object",
      properties: {
        listingIds: {
          type: "array",
          items: { type: "string" },
          description: "Array of listing IDs to compare",
        },
      },
      required: ["listingIds"],
    },
  },
];

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  switch (toolName) {
    case "search_listings":
      return {
        tool: toolName,
        result: await searchListings(args),
      };
    case "get_coe_price":
      return {
        tool: toolName,
        result: getCOEPrice(),
      };
    case "calculate_road_tax":
      return {
        tool: toolName,
        result: calculateRoadTax(args.engineSize as number),
      };
    case "calculate_depreciation":
      return {
        tool: toolName,
        result: calculateDepreciation(args),
      };
    case "get_coe_statistics":
      return {
        tool: toolName,
        result: getCOEStats(),
      };
    case "compare_bikes":
      return {
        tool: toolName,
        result: await compareBikes(args.listingIds as string[]),
      };
    default:
      return { tool: toolName, result: { error: "Unknown tool" } };
  }
}

async function searchListings(
  args: Record<string, unknown>
): Promise<unknown> {
  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (args.brand) where.brand = { contains: args.brand as string, mode: "insensitive" };
  if (args.minPrice || args.maxPrice) {
    where.price = {};
    if (args.minPrice) (where.price as Record<string, unknown>).gte = args.minPrice;
    if (args.maxPrice) (where.price as Record<string, unknown>).lte = args.maxPrice;
  }
  if (args.licenseClass) where.licenseClass = args.licenseClass;

  const listings = await prisma.listing.findMany({
    where,
    take: (args.limit as number) || 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      brand: true,
      model: true,
      year: true,
      engineSize: true,
      price: true,
      mileage: true,
      condition: true,
      licenseClass: true,
      coeExpiryDate: true,
    },
  });

  return { count: listings.length, listings };
}

function getCOEPrice() {
  const latest = getLatestCOEPrice();
  const pqp = getLatestPQP();
  return {
    latestPremium: latest ?? null,
    pqp: pqp ?? null,
    category: "D (Motorcycle)",
  };
}

function calculateRoadTax(engineSize: number) {
  let annual: number;
  if (engineSize <= 600) annual = 372;
  else if (engineSize <= 1000) annual = 744;
  else if (engineSize <= 1600) annual = 1488;
  else if (engineSize <= 3000) annual = 2976;
  else annual = 3720;

  return {
    engineSize,
    annualRoadTax: annual,
    halfYearRoadTax: annual / 2,
    currency: "SGD",
  };
}

function calculateDepreciation(args: Record<string, unknown>) {
  const purchasePrice = args.purchasePrice as number;
  const coeExpiry = new Date(args.coeExpiryDate as string);
  const now = args.currentDate ? new Date(args.currentDate as string) : new Date();

  const remainingMs = coeExpiry.getTime() - now.getTime();
  const remainingMonths = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60 * 24 * 30.44)));
  const remainingYears = (remainingMonths / 12).toFixed(1);

  const monthlyDepreciation =
    remainingMonths > 0 ? purchasePrice / remainingMonths : 0;
  const annualDepreciation = monthlyDepreciation * 12;

  return {
    purchasePrice,
    coeExpiryDate: args.coeExpiryDate,
    remainingMonths,
    remainingYears,
    monthlyDepreciation: Math.round(monthlyDepreciation),
    annualDepreciation: Math.round(annualDepreciation),
    currency: "SGD",
  };
}

function getCOEStats() {
  return getCOEStatistics();
}

async function compareBikes(listingIds: string[]): Promise<unknown> {
  if (!listingIds?.length) return { error: "No listing IDs provided" };

  const listings = await prisma.listing.findMany({
    where: { id: { in: listingIds } },
    select: {
      id: true,
      title: true,
      brand: true,
      model: true,
      year: true,
      engineSize: true,
      power: true,
      weight: true,
      torque: true,
      mileage: true,
      price: true,
      condition: true,
      type: true,
      licenseClass: true,
      coeExpiryDate: true,
      omv: true,
      fuelConsumption: true,
    },
  });

  return { count: listings.length, bikes: listings };
}
