import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SEO");
  return {
    title: t("compareTitle"),
    description: t("compareDescription"),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
