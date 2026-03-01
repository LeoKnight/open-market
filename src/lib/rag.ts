import { VectorStore, type SearchResult } from "./vector-store";
import { loadAllDocuments } from "@/knowledge-base";
import { chunkAllDocuments, type KBChunk } from "./chunker";
import { classifyIntent, type ClassifiedIntent } from "./intent-router";
import { AI_TOOLS, executeTool, type ToolResult } from "./ai-tools";
import type { ChatMessage, AIContext } from "./ai";

const AI_CONFIG = {
  apiKey: process.env.QWEN_API_KEY!,
  model: process.env.QWEN_MODEL || "Qwen/Qwen3-235B-A22B",
  endpoint:
    process.env.QWEN_ENDPOINT ||
    "https://api-inference.bitdeer.ai/v1/chat/completions",
};

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  zh: "Chinese (Simplified)",
  fr: "French",
  es: "Spanish",
  ja: "Japanese",
  ko: "Korean",
};

let storeInitialized = false;

async function ensureVectorStore(): Promise<VectorStore> {
  const store = VectorStore.getInstance();
  await store.load();

  if (!store.isReady()) {
    if (storeInitialized) return store;
    storeInitialized = true;

    console.log("[RAG] Initializing knowledge base...");
    const docs = loadAllDocuments();
    const chunks = chunkAllDocuments(docs);
    console.log(
      `[RAG] Loaded ${docs.length} documents → ${chunks.length} chunks`
    );

    try {
      await store.addChunks(chunks);
      store.persist();
      console.log("[RAG] Knowledge base indexed with embeddings");
    } catch (err) {
      console.warn(
        "[RAG] Embedding API unavailable, falling back to keyword search:",
        (err as Error).message
      );
      for (const chunk of chunks) {
        chunk.embedding = undefined;
      }
      await store.addChunks(chunks);
      store.persist();
    }
  }

  return store;
}

function formatRetrievedContext(results: SearchResult[]): string {
  if (results.length === 0) return "";

  const sections = results.map((r, i) => {
    const src = r.chunk.source.replace(/\//g, " > ");
    return `[Source ${i + 1}: ${src} - ${r.chunk.section}]\n${r.chunk.content}`;
  });

  return `\n\n--- KNOWLEDGE BASE CONTEXT ---\nThe following information comes from our verified knowledge base. Use it to answer accurately. Always prioritize this information over your general knowledge for Singapore-specific regulations and market data.\n\n${sections.join("\n\n---\n\n")}\n--- END KNOWLEDGE BASE ---`;
}

function formatToolResults(toolResults: ToolResult[]): string {
  if (toolResults.length === 0) return "";

  const sections = toolResults.map((tr) => {
    return `[Tool: ${tr.tool}]\n${JSON.stringify(tr.result, null, 2)}`;
  });

  return `\n\n--- TOOL RESULTS ---\n${sections.join("\n\n")}\n--- END TOOL RESULTS ---`;
}

function buildRAGSystemPrompt(
  context: AIContext | undefined,
  retrievedContext: string,
  toolContext: string,
  intent: ClassifiedIntent
): string {
  const locale = context?.locale || "en";
  const langInstruction = `You MUST respond in ${LOCALE_NAMES[locale] || "English"}.`;

  let base = `You are MotoAI, an expert motorcycle assistant for the Open Market platform — a Singapore-based used motorcycle marketplace. You have deep knowledge of motorcycle brands, models, specifications, maintenance, Singapore traffic regulations, COE (Certificate of Entitlement) system, insurance, and pricing trends. Be helpful, concise, and friendly. ${langInstruction}`;

  if (intent.type === "regulation") {
    base += `\n\nThe user is asking about Singapore regulations/policies. You have access to our verified knowledge base below. Answer based on the knowledge base information. Cite specific numbers, rates, and dates from the knowledge base. If the knowledge base doesn't cover the question, say so and provide your best knowledge with a disclaimer.`;
  } else if (intent.type === "market") {
    base += `\n\nThe user is asking about market data, pricing, or recommendations. Use the knowledge base and any tool results to provide data-driven answers.`;
  }

  if (context?.listing) {
    const l = context.listing;
    base += `\n\nThe user is viewing this motorcycle listing:\nTitle: ${l.title}\nBrand: ${l.brand} | Model: ${l.model} | Year: ${l.year}\nEngine: ${l.engineSize}cc | Power: ${l.power || "N/A"} HP | Weight: ${l.weight || "N/A"} kg\nMileage: ${l.mileage} km | Price: S$${l.price}\nCondition: ${l.condition} | Type: ${l.type}\nCOE Expiry: ${l.coeExpiryDate || "N/A"} | OMV: ${l.omv || "N/A"}\nLocation: ${l.location}\nDescription: ${l.description || "N/A"}\n\nUse this data to answer questions about this motorcycle. Provide value-driven insights about pricing, maintenance, and suitability.`;
  }

  if (context?.comparisons && context.comparisons.length > 0) {
    const compText = context.comparisons
      .map(
        (c, i) =>
          `Bike ${i + 1}: ${c.brand} ${c.model} (${c.year}) - ${c.engineSize}cc, ${c.power || "?"} HP, S$${c.price}, ${c.mileage} km`
      )
      .join("\n");
    base += `\n\nThe user is comparing these motorcycles:\n${compText}\n\nProvide a detailed, objective comparison.`;
  }

  if (context?.page === "listing-form") {
    base += `\n\nThe user is creating a motorcycle listing. Help them write compelling titles, descriptions, and suggest fair pricing.`;
  }

  base += retrievedContext;
  base += toolContext;

  return base;
}

function shouldUseTool(
  intent: ClassifiedIntent,
  query: string
): string | null {
  const q = query.toLowerCase();

  if (
    intent.type === "tool" ||
    q.includes("latest coe") ||
    q.includes("最新coe") ||
    q.includes("current coe") ||
    q.includes("coe price now") ||
    q.includes("coe多少")
  ) {
    if (
      q.includes("coe") &&
      (q.includes("latest") ||
        q.includes("current") ||
        q.includes("最新") ||
        q.includes("当前") ||
        q.includes("now") ||
        q.includes("多少"))
    ) {
      return "get_coe_price";
    }
    if (
      q.includes("road tax") ||
      q.includes("路税") ||
      (q.includes("tax") && q.includes("calcul"))
    ) {
      return "calculate_road_tax";
    }
    if (
      q.includes("depreciation") ||
      q.includes("折旧")
    ) {
      return "calculate_depreciation";
    }
    if (
      q.includes("search") ||
      q.includes("find") ||
      q.includes("搜索") ||
      q.includes("找")
    ) {
      return "search_listings";
    }
    if (q.includes("statistic") || q.includes("统计")) {
      return "get_coe_statistics";
    }
  }

  return null;
}

export interface RAGResponse {
  stream: ReadableStream<Uint8Array>;
  sources: Array<{ source: string; section: string; score: number }>;
  intent: ClassifiedIntent;
  toolsUsed: string[];
}

export async function ragChat(
  messages: ChatMessage[],
  context?: AIContext
): Promise<RAGResponse> {
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const query =
    typeof lastUserMessage?.content === "string"
      ? lastUserMessage.content
      : "";

  const intent = classifyIntent(query, context);
  let retrievedContext = "";
  let toolContext = "";
  const sources: RAGResponse["sources"] = [];
  const toolsUsed: string[] = [];

  if (intent.type === "regulation" || intent.type === "market") {
    try {
      const store = await ensureVectorStore();
      const results = await store.hybridSearch(query, {
        topK: 5,
        category:
          intent.type === "regulation" ? intent.category : undefined,
      });

      if (results.length > 0) {
        retrievedContext = formatRetrievedContext(results);
        for (const r of results) {
          sources.push({
            source: r.chunk.source,
            section: r.chunk.section,
            score: r.score,
          });
        }
      }
    } catch (err) {
      console.error("[RAG] Search failed:", err);
    }
  }

  const toolName = shouldUseTool(intent, query);
  if (toolName) {
    try {
      const toolArgs = extractToolArgs(toolName, query);
      const result = await executeTool(toolName, toolArgs);
      toolContext = formatToolResults([result]);
      toolsUsed.push(toolName);
    } catch (err) {
      console.error("[RAG] Tool execution failed:", err);
    }
  }

  const systemPrompt = buildRAGSystemPrompt(
    context,
    retrievedContext,
    toolContext,
    intent
  );

  const fullMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const response = await fetch(AI_CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: fullMessages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errText}`);
  }

  return {
    stream: response.body!,
    sources,
    intent,
    toolsUsed,
  };
}

function extractToolArgs(
  toolName: string,
  query: string
): Record<string, unknown> {
  const q = query.toLowerCase();

  switch (toolName) {
    case "calculate_road_tax": {
      const ccMatch = q.match(/(\d+)\s*cc/);
      return { engineSize: ccMatch ? parseInt(ccMatch[1]) : 600 };
    }
    case "calculate_depreciation": {
      const priceMatch = q.match(/\$?\s*([\d,]+)/);
      const price = priceMatch
        ? parseInt(priceMatch[1].replace(/,/g, ""))
        : 10000;
      const dateMatch = q.match(/(\d{4}-\d{2}-\d{2})/);
      return {
        purchasePrice: price,
        coeExpiryDate: dateMatch ? dateMatch[1] : "2030-01-01",
      };
    }
    case "search_listings": {
      const brandMatch = q.match(
        /\b(honda|yamaha|kawasaki|suzuki|ducati|bmw|triumph|ktm|vespa)\b/i
      );
      const classMatch = q.match(/class\s*(2b|2a|2)/i);
      const args: Record<string, unknown> = { limit: 5 };
      if (brandMatch) args.brand = brandMatch[1];
      if (classMatch) {
        args.licenseClass = `CLASS_${classMatch[1].toUpperCase()}`;
      }
      return args;
    }
    default:
      return {};
  }
}

export { ensureVectorStore };
export type { KBChunk };
