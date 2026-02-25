import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minEngine = searchParams.get("minEngine");
    const maxEngine = searchParams.get("maxEngine");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (brand && brand !== "all") {
      where.brand = brand;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice)
        (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice)
        (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    if (minEngine || maxEngine) {
      where.engineSize = {};
      if (minEngine)
        (where.engineSize as Record<string, number>).gte = parseInt(minEngine);
      if (maxEngine)
        (where.engineSize as Record<string, number>).lte = parseInt(maxEngine);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      brand,
      model,
      year,
      engineSize,
      mileage,
      type,
      price,
      condition,
      description,
      location,
      images,
    } = body;

    if (
      !title ||
      !brand ||
      !model ||
      !year ||
      !engineSize ||
      mileage == null ||
      !price ||
      !location
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        brand,
        model,
        year: parseInt(year),
        engineSize: parseInt(engineSize),
        mileage: parseInt(mileage),
        type: type || "OTHER",
        price: parseFloat(price),
        condition: condition || "GOOD",
        description,
        location,
        images: images || [],
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
