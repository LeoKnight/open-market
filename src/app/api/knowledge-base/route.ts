import { NextResponse } from "next/server";
import { loadAllDocuments } from "@/knowledge-base";
import { chunkDocument } from "@/lib/chunker";
import { VectorStore } from "@/lib/vector-store";

export async function GET() {
  try {
    const docs = loadAllDocuments();
    const summary = docs.map((doc) => {
      const chunks = chunkDocument(doc);
      return {
        id: doc.id,
        filename: doc.filename,
        category: doc.category,
        tags: doc.tags,
        lastUpdated: doc.lastUpdated,
        chunkCount: chunks.length,
        contentLength: doc.content.length,
      };
    });

    const store = VectorStore.getInstance();
    const stats = store.getStats();

    return NextResponse.json({
      documents: summary,
      totalDocuments: docs.length,
      vectorStore: stats,
    });
  } catch (error) {
    console.error("KB list error:", error);
    return NextResponse.json(
      { error: "Failed to list knowledge base" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, content, category, tags } = body as {
      filename: string;
      content: string;
      category?: string;
      tags?: string[];
    };

    if (!filename || !content) {
      return NextResponse.json(
        { error: "filename and content are required" },
        { status: 400 }
      );
    }

    const fs = await import("fs");
    const path = await import("path");
    const { getKBBasePath } = await import("@/knowledge-base");

    const basePath = getKBBasePath();
    const filePath = path.join(basePath, "documents", `${filename}.md`);

    const frontmatter = [
      "---",
      `category: ${category || "general"}`,
      `tags: [${(tags || []).join(", ")}]`,
      `lastUpdated: "${new Date().toISOString().slice(0, 7)}"`,
      "---",
      "",
    ].join("\n");

    fs.writeFileSync(filePath, frontmatter + content, "utf-8");

    return NextResponse.json({
      success: true,
      id: `documents/${filename}`,
      message: "Document added. Run reindex to update the vector store.",
    });
  } catch (error) {
    console.error("KB add error:", error);
    return NextResponse.json(
      { error: "Failed to add document" },
      { status: 500 }
    );
  }
}
