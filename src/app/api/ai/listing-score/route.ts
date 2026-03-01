import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { generateCacheKey, getCache, setCache, CACHE_TTL } from "@/lib/ai-cache";

const AI_CONFIG = {
  apiKey: process.env.QWEN_API_KEY!,
  model: process.env.QWEN_MODEL || "Qwen/Qwen3-235B-A22B",
  endpoint:
    process.env.QWEN_ENDPOINT ||
    "https://api-inference.bitdeer.ai/v1/chat/completions",
};

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, RATE_LIMITS.ai, "ai-listing-score");
    if (!rl.success) return rateLimitResponse();

    const body = await request.json();
    const { title, description, brand, model, year, engineSize, price, mileage, condition, images, coeExpiryDate, omv, power, weight, locale } = body;

    const cacheParams = {
      title, description, brand, model, year, engineSize,
      price, mileage, condition, imageCount: images?.length || 0,
      coeExpiryDate, omv, power, weight, locale,
    };
    const cacheKey = generateCacheKey("listing-score", cacheParams);

    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ score: JSON.parse(cached), cached: true });
    }

    const prompt = `You are a motorcycle listing quality expert. Analyze the following motorcycle listing and provide a quality score. Respond in ${locale === "zh" ? "Chinese" : locale === "fr" ? "French" : locale === "es" ? "Spanish" : locale === "ja" ? "Japanese" : locale === "ko" ? "Korean" : "English"}.

LISTING DATA:
- Title: ${title || "MISSING"}
- Description: ${description || "MISSING"}
- Brand: ${brand || "MISSING"} | Model: ${model || "MISSING"}
- Year: ${year || "MISSING"} | Engine: ${engineSize || "MISSING"}cc
- Price: ${price ? `S$${price}` : "MISSING"}
- Mileage: ${mileage ? `${mileage}km` : "MISSING"}
- Condition: ${condition || "MISSING"}
- Images: ${images?.length || 0} photos
- COE Expiry: ${coeExpiryDate || "MISSING"}
- OMV: ${omv ? `S$${omv}` : "MISSING"}
- Power: ${power ? `${power}HP` : "MISSING"}
- Weight: ${weight ? `${weight}kg` : "MISSING"}

Evaluate and return a JSON object:
{
  "overallScore": number (0-100),
  "dimensions": {
    "titleQuality": { "score": number (0-100), "feedback": "string" },
    "descriptionQuality": { "score": number (0-100), "feedback": "string" },
    "photoCount": { "score": number (0-100), "feedback": "string" },
    "priceReasonability": { "score": number (0-100), "feedback": "string" },
    "infoCompleteness": { "score": number (0-100), "feedback": "string" }
  },
  "missingFields": ["string"],
  "improvements": ["string"],
  "strengths": ["string"]
}

Return ONLY the JSON.`;

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

    if (!response.ok) throw new Error(`AI API error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse score", raw: content },
        { status: 422 }
      );
    }

    const score = JSON.parse(jsonMatch[0]);
    await setCache(cacheKey, "listing-score", JSON.stringify(score), CACHE_TTL.listingScore);

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Listing score error:", error);
    return NextResponse.json(
      { error: "Failed to score listing" },
      { status: 500 }
    );
  }
}
