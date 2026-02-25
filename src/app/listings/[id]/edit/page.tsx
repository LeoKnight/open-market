import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ListingForm from "@/components/ListingForm";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update the details of your listing
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
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
            }}
            isEdit
          />
        </div>
      </div>
    </div>
  );
}
