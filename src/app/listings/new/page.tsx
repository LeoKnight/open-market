import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ListingForm from "@/components/ListingForm";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewListingPage() {
  const t = await getTranslations("Listings");
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {t("listYourMotorcycle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("fillDetails")}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <ListingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
