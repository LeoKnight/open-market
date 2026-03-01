import { NextRequest, NextResponse } from "next/server";
import { callVision } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mimeType } = body as {
      image: string;
      mimeType?: string;
    };

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    const rawResult = await callVision(image, mimeType || "image/jpeg");

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
