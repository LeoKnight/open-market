import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ListingForm from "@/components/ListingForm";

export default async function NewListingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            List Your Motorcycle
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below to create your listing
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <ListingForm />
        </div>
      </div>
    </div>
  );
}
