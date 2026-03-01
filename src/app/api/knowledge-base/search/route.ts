import { NextRequest, NextResponse } from "next/server";
import { ensureVectorStore } from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK, category, mode } = body as {
      query: string;
      topK?: number;
      category?: string;
      mode?: "hybrid" | "vector" | "keyword";
    };

    if (!query) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const store = await ensureVectorStore();
    const searchMode = mode || "hybrid";
    const options = { topK: topK || 5, category };

    let results;
    switch (searchMode) {
      case "vector":
        results = await store.search(query, options);
        break;
      case "keyword":
        results = await store.keywordSearch(query, options);
        break;
      default:
        results = await store.hybridSearch(query, options);
    }

    return NextResponse.json({
      query,
      mode: searchMode,
      results: results.map((r) => ({
        id: r.chunk.id,
        source: r.chunk.source,
        section: r.chunk.section,
        category: r.chunk.category,
        tags: r.chunk.tags,
        score: r.score,
        content: r.chunk.content.slice(0, 500),
      })),
      totalResults: results.length,
    });
  } catch (error) {
    console.error("KB search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
