import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLatestCOEPrice, getLatestPQP } from "@/data/motorcycle-coe-data";

const AI_CONFIG = {
  apiKey: process.env.QWEN_API_KEY!,
  model: process.env.QWEN_MODEL || "Qwen/Qwen3-235B-A22B",
  endpoint:
    process.env.QWEN_ENDPOINT ||
    "https://api-inference.bitdeer.ai/v1/chat/completions",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand, model, year, engineSize, mileage, condition, coeExpiryDate, omv, locale } =
      body as {
        brand: string;
        model: string;
        year: number;
        engineSize: number;
        mileage: number;
        condition?: string;
        coeExpiryDate?: string;
        omv?: number;
        locale?: string;
      };

    if (!brand || !model || !year || !engineSize) {
      return NextResponse.json(
        { error: "brand, model, year, engineSize are required" },
        { status: 400 }
      );
    }

    const similarListings = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        brand: { contains: brand, mode: "insensitive" },
        engineSize: { gte: engineSize - 100, lte: engineSize + 100 },
        year: { gte: year - 3, lte: year + 3 },
      },
      take: 10,
      orderBy: { price: "asc" },
      select: {
        title: true,
        brand: true,
        model: true,
        year: true,
        engineSize: true,
        mileage: true,
        price: true,
        condition: true,
        coeExpiryDate: true,
      },
    });

    const coePrice = getLatestCOEPrice() as number | null;
    const pqpPrice = getLatestPQP() as number | null;

    const LOCALE_NAMES: Record<string, string> = {
      en: "English", zh: "Chinese (Simplified)", fr: "French",
      es: "Spanish", ja: "Japanese", ko: "Korean",
    };
    const lang = LOCALE_NAMES[locale || "en"] || "English";

    const prompt = `You are a motorcycle pricing expert in Singapore. Analyze the following motorcycle and provide a comprehensive pricing analysis. Respond in ${lang}.

MOTORCYCLE TO ANALYZE:
- Brand: ${brand}
- Model: ${model}
- Year: ${year}
- Engine: ${engineSize}cc
- Mileage: ${mileage} km
- Condition: ${condition || "N/A"}
- COE Expiry: ${coeExpiryDate || "N/A"}
- OMV: ${omv ? `S$${omv}` : "N/A"}

MARKET DATA:
- Current COE (Cat D): ${coePrice ? `S$${coePrice}` : "N/A"}
- Current PQP: ${pqpPrice ? `S$${pqpPrice}` : "N/A"}
- Similar listings found: ${similarListings.length}
${similarListings.length > 0 ? `Similar listings:\n${similarListings.map((l: { brand: string; model: string; year: number; engineSize: number; mileage: number; price: number; condition: string }) => `  - ${l.brand} ${l.model} (${l.year}), ${l.engineSize}cc, ${l.mileage}km, S$${l.price}, ${l.condition}`).join("\n")}` : "No similar listings found in database."}

Please provide your analysis as a JSON object with this exact structure:
{
  "suggestedPriceRange": { "low": number, "mid": number, "high": number },
  "marketPosition": "below_market" | "fair" | "above_market",
  "competitivenessScore": number (1-10),
  "factors": [
    { "factor": "string", "impact": "positive" | "negative" | "neutral", "detail": "string" }
  ],
  "summary": "string (2-3 sentence summary)",
  "recommendation": "string (pricing recommendation)"
}

Return ONLY the JSON object, no other text.`;

    const response = await fetch(AI_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse pricing analysis", raw: content },
        { status: 422 }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      analysis,
      marketData: {
        similarListings: similarListings.length,
        currentCOE: coePrice,
        currentPQP: pqpPrice,
      },
    });
  } catch (error) {
    console.error("Pricing analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate pricing analysis" },
      { status: 500 }
    );
  }
}
