import { NextRequest, NextResponse } from "next/server";
import { loadDocument, getKBBasePath } from "@/knowledge-base";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docId = `documents/${id}`;
    const doc = loadDocument(docId);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ document: doc });
  } catch (error) {
    console.error("KB get error:", error);
    return NextResponse.json(
      { error: "Failed to get document" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body as { content: string };

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    const fs = await import("fs");
    const path = await import("path");
    const basePath = getKBBasePath();
    const filePath = path.join(basePath, "documents", `${id}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    fs.writeFileSync(filePath, content, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Document updated. Run reindex to update the vector store.",
    });
  } catch (error) {
    console.error("KB update error:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const fs = await import("fs");
    const path = await import("path");
    const basePath = getKBBasePath();
    const filePath = path.join(basePath, "documents", `${id}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: "Document deleted. Run reindex to update the vector store.",
    });
  } catch (error) {
    console.error("KB delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
