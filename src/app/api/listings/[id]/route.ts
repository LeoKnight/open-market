import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        user: {
          select: { id: true, name: true, image: true, createdAt: true, isDealer: true, shopName: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("GET /api/listings/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.listing.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title, brand, model, year, engineSize, mileage, type, price, condition,
      description, location, images, status, power, weight, torque,
      fuelConsumption, registrationDate, omv, coeExpiryDate, licenseClass,
      contactWhatsapp, contactPhone,
    } = body;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(brand && { brand }),
        ...(model && { model }),
        ...(year != null && { year: parseInt(year) }),
        ...(engineSize != null && { engineSize: parseInt(engineSize) }),
        ...(mileage != null && { mileage: parseInt(mileage) }),
        ...(type && { type }),
        ...(price != null && { price: parseFloat(price) }),
        ...(condition && { condition }),
        ...(description !== undefined && { description }),
        ...(location && { location }),
        ...(images && { images }),
        ...(status && { status }),
        ...(power !== undefined && { power: power ? parseInt(power) : null }),
        ...(weight !== undefined && { weight: weight ? parseInt(weight) : null }),
        ...(torque !== undefined && { torque: torque ? parseFloat(torque) : null }),
        ...(fuelConsumption !== undefined && { fuelConsumption: fuelConsumption ? parseFloat(fuelConsumption) : null }),
        ...(registrationDate !== undefined && { registrationDate: registrationDate ? new Date(registrationDate) : null }),
        ...(omv !== undefined && { omv: omv ? parseFloat(omv) : null }),
        ...(coeExpiryDate !== undefined && { coeExpiryDate: coeExpiryDate ? new Date(coeExpiryDate) : null }),
        ...(licenseClass !== undefined && { licenseClass: licenseClass || null }),
        ...(contactWhatsapp !== undefined && { contactWhatsapp: contactWhatsapp || null }),
        ...(contactPhone !== undefined && { contactPhone: contactPhone || null }),
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("PUT /api/listings/[id] error:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.listing.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/listings/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
