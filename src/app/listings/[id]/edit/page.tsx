import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ListingForm from "@/components/ListingForm";
import { Card, CardContent } from "@/components/ui/card";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("Listings");
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    notFound();
  }

  if (listing.userId !== session.user.id) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{t("editListing")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("updateDetails")}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <ListingForm
            initialData={{
              id: listing.id,
              title: listing.title,
              brand: listing.brand,
              model: listing.model,
              year: listing.year,
              engineSize: listing.engineSize,
              mileage: listing.mileage,
              type: listing.type,
              price: listing.price,
              condition: listing.condition,
              description: listing.description || "",
              location: listing.location,
              images: listing.images,
              power: listing.power,
              weight: listing.weight,
              torque: listing.torque,
              fuelConsumption: listing.fuelConsumption,
              registrationDate: listing.registrationDate?.toISOString() || null,
              omv: listing.omv,
              coeExpiryDate: listing.coeExpiryDate?.toISOString() || null,
              licenseClass: listing.licenseClass,
              contactWhatsapp: listing.contactWhatsapp,
              contactPhone: listing.contactPhone,
            }}
            isEdit
          />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
