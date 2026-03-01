export const AI_CONFIG = {
  apiKey: process.env.QWEN_API_KEY!,
  model: process.env.QWEN_MODEL || "Qwen/Qwen3-235B-A22B",
  endpoint:
    process.env.QWEN_ENDPOINT ||
    "https://api-inference.bitdeer.ai/v1/chat/completions",
};

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface AIContext {
  page?: string;
  locale?: string;
  listing?: Record<string, unknown>;
  comparisons?: Record<string, unknown>[];
  formData?: Record<string, unknown>;
}

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  zh: "Chinese (Simplified)",
  fr: "French",
  es: "Spanish",
  ja: "Japanese",
  ko: "Korean",
};

export function buildSystemPrompt(context?: AIContext): string {
  const locale = context?.locale || "en";
  const langInstruction = `You MUST respond in ${LOCALE_NAMES[locale] || "English"}.`;

  const base = `You are MotoAI, an expert motorcycle assistant for the Open Market platform — a Singapore-based used motorcycle marketplace. You have deep knowledge of motorcycle brands, models, specifications, maintenance, Singapore traffic regulations, COE (Certificate of Entitlement) system, insurance, and pricing trends. Be helpful, concise, and friendly. ${langInstruction}`;

  if (context?.listing) {
    const l = context.listing;
    return `${base}\n\nThe user is viewing this motorcycle listing:\nTitle: ${l.title}\nBrand: ${l.brand} | Model: ${l.model} | Year: ${l.year}\nEngine: ${l.engineSize}cc | Power: ${l.power || "N/A"} HP | Weight: ${l.weight || "N/A"} kg\nMileage: ${l.mileage} km | Price: S$${l.price}\nCondition: ${l.condition} | Type: ${l.type}\nCOE Expiry: ${l.coeExpiryDate || "N/A"} | OMV: ${l.omv || "N/A"}\nLocation: ${l.location}\nDescription: ${l.description || "N/A"}\n\nUse this data to answer questions about this motorcycle. Provide value-driven insights about pricing, maintenance, and suitability.`;
  }

  if (context?.comparisons && context.comparisons.length > 0) {
    const compText = context.comparisons
      .map(
        (c, i) =>
          `Bike ${i + 1}: ${c.brand} ${c.model} (${c.year}) - ${c.engineSize}cc, ${c.power || "?"} HP, S$${c.price}, ${c.mileage} km`
      )
      .join("\n");
    return `${base}\n\nThe user is comparing these motorcycles:\n${compText}\n\nProvide a detailed, objective comparison with pros/cons for each motorcycle.`;
  }

  if (context?.page === "listing-form") {
    return `${base}\n\nThe user is creating a motorcycle listing. Help them write compelling titles, descriptions, and suggest fair pricing. When generating ad copy, be professional yet engaging. Highlight key selling points.`;
  }

  return base;
}

export function buildVisionPrompt(): string {
  return `You are an OCR specialist for motorcycle documents. Extract ALL information visible in this motorcycle detail card / registration document image. Return ONLY a valid JSON object with these fields (use null for missing fields):

{
  "brand": "string or null",
  "model": "string or null",
  "year": "number or null",
  "engineSize": "number (cc) or null",
  "mileage": "number (km) or null",
  "power": "number (HP) or null",
  "weight": "number (kg) or null",
  "torque": "number (Nm) or null",
  "registrationDate": "YYYY-MM-DD string or null",
  "omv": "number or null",
  "coeExpiryDate": "YYYY-MM-DD string or null",
  "type": "one of SPORT/TOURING/CRUISER/SPORT_TOURING/ADVENTURE/NAKED/SCOOTER/OTHER or null",
  "licenseClass": "one of CLASS_2B/CLASS_2A/CLASS_2 or null",
  "condition": "one of EXCELLENT/GOOD/FAIR/POOR or null"
}

Do NOT include any explanation. Return ONLY the JSON.`;
}

export async function streamChat(
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(AI_CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  return response.body!;
}

export async function callVision(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const response = await fetch(AI_CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildVisionPrompt() },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
