import { NextResponse } from "next/server";
import { loadAllDocuments } from "@/knowledge-base";
import { chunkAllDocuments } from "@/lib/chunker";
import { VectorStore } from "@/lib/vector-store";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const docs = loadAllDocuments();
    const chunks = chunkAllDocuments(docs);

    console.log(
      `[Reindex] Processing ${docs.length} documents → ${chunks.length} chunks`
    );

    const store = VectorStore.getInstance();

    try {
      await store.addChunks(chunks);
      store.persist();
    } catch (embError) {
      console.warn(
        "[Reindex] Embedding failed, using keyword-only mode:",
        (embError as Error).message
      );
      for (const chunk of chunks) {
        chunk.embedding = undefined;
      }
      await store.addChunks(chunks);
      store.persist();
    }

    const stats = store.getStats();

    return NextResponse.json({
      success: true,
      documentsProcessed: docs.length,
      chunksCreated: chunks.length,
      vectorStore: stats,
    });
  } catch (error) {
    console.error("Reindex error:", error);
    return NextResponse.json(
      { error: "Failed to reindex knowledge base" },
      { status: 500 }
    );
  }
}
