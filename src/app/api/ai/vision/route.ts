import { NextRequest, NextResponse } from "next/server";
import { callVision, callTextExtraction } from "@/lib/ai";
import { PDFParse } from "pdf-parse";
import { rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, RATE_LIMITS.ai, "ai-vision");
    if (!rl.success) return rateLimitResponse();
    const body = await request.json();
    const { image, mimeType } = body as {
      image: string;
      mimeType?: string;
    };

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    let rawResult: string;

    if (mimeType === "application/pdf") {
      const pdfBuffer = Buffer.from(image, "base64");
      const pdf = new PDFParse({ data: new Uint8Array(pdfBuffer) });
      const textResult = await pdf.getText();
      await pdf.destroy();
      rawResult = await callTextExtraction(textResult.text);
    } else {
      rawResult = await callVision(image, mimeType || "image/jpeg");
    }

    const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error("Vision API error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
