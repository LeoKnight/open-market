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
    const licenseClass = searchParams.get("licenseClass");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = { status: "ACTIVE" };

    if (brand && brand !== "all") where.brand = brand;
    if (type && type !== "all") where.type = type;
    if (licenseClass && licenseClass !== "all") where.licenseClass = licenseClass;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    if (minEngine || maxEngine) {
      where.engineSize = {};
      if (minEngine) (where.engineSize as Record<string, number>).gte = parseInt(minEngine);
      if (maxEngine) (where.engineSize as Record<string, number>).lte = parseInt(maxEngine);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "mileage_asc") orderBy = { mileage: "asc" };
    else if (sort === "views_desc") orderBy = { views: "desc" };
    else if (sort === "oldest") orderBy = { createdAt: "asc" };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
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
      title, brand, model, year, engineSize, mileage, type, price, condition,
      description, location, images, power, weight, torque, fuelConsumption,
      registrationDate, omv, coeExpiryDate, licenseClass, contactWhatsapp, contactPhone,
      isVerified,
    } = body;

    if (!title || !brand || !model || !year || !engineSize || mileage == null || !price || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parsedYear = parseInt(year);
    const parsedEngine = parseInt(engineSize);
    const parsedMileage = parseInt(mileage);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear() + 1) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }
    if (isNaN(parsedEngine) || parsedEngine < 1 || parsedEngine > 3000) {
      return NextResponse.json({ error: "Invalid engine size" }, { status: 400 });
    }
    if (isNaN(parsedMileage) || parsedMileage < 0 || parsedMileage > 999999) {
      return NextResponse.json({ error: "Invalid mileage" }, { status: 400 });
    }
    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 9999999) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    if (typeof title !== "string" || title.length > 200) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    if (typeof brand !== "string" || brand.length > 50) {
      return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
    }
    if (typeof model !== "string" || model.length > 100) {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }
    if (images && (!Array.isArray(images) || images.length > 20)) {
      return NextResponse.json({ error: "Too many images" }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        title: title.trim(),
        brand: brand.trim(),
        model: model.trim(),
        year: parsedYear,
        engineSize: parsedEngine,
        mileage: parsedMileage,
        type: type || "OTHER",
        price: parsedPrice,
        condition: condition || "GOOD",
        description,
        location,
        images: images || [],
        power: power ? parseInt(power) : null,
        weight: weight ? parseInt(weight) : null,
        torque: torque ? parseFloat(torque) : null,
        fuelConsumption: fuelConsumption ? parseFloat(fuelConsumption) : null,
        registrationDate: registrationDate ? new Date(registrationDate) : null,
        omv: omv ? parseFloat(omv) : null,
        coeExpiryDate: coeExpiryDate ? new Date(coeExpiryDate) : null,
        licenseClass: licenseClass || null,
        contactWhatsapp: contactWhatsapp || null,
        contactPhone: contactPhone || null,
        isVerified: isVerified === true,
        verificationSource: isVerified ? "ai-vision" : null,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings error:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
