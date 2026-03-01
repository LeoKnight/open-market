import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listingId } = await params;

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        listingId,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Already favorited" }, { status: 409 });
    }
    console.error("POST /api/favorites error:", error);
    return NextResponse.json({ error: "Failed to favorite" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listingId } = await params;

    await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        listingId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/favorites error:", error);
    return NextResponse.json({ error: "Failed to unfavorite" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ favorited: false });
  }

  try {
    const { listingId } = await params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    });

    return NextResponse.json({ favorited: !!favorite });
  } catch (error) {
    console.error("GET /api/favorites/[listingId] error:", error);
    return NextResponse.json({ favorited: false });
  }
}
