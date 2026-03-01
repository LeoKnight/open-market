import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AuthProvider from "@/components/AuthProvider";
import AIAssistant from "@/components/AIAssistant";
import { AIAssistantProvider } from "@/hooks/useAIContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { connection } from "next/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://open-market-sg.vercel.app";
const LOCALES = ["en", "zh", "fr", "es", "ja", "ko"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | Open Market`,
    },
    description,
    keywords: [
      "used motorcycle", "Singapore motorcycle", "motorcycle marketplace",
      "buy motorcycle Singapore", "sell motorcycle", "COE motorcycle",
      "二手摩托车", "新加坡摩托车", "moto occasion Singapour",
      "motocicleta usada", "中古バイク シンガポール", "중고 오토바이 싱가포르",
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      siteName: "Open Market",
      type: "website",
      url: SITE_URL,
      locale: "en_SG",
      alternateLocale: ["zh_CN", "fr_FR", "es_ES", "ja_JP", "ko_KR"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: SITE_URL,
      languages: Object.fromEntries(
        LOCALES.map((loc) => [loc, `${SITE_URL}?locale=${loc}`])
      ),
    },
  };
}

async function LocalizedLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${locale}"`,
        }}
      />
      <NextIntlClientProvider messages={messages}>
        <AuthProvider>
          <TooltipProvider>
            <AIAssistantProvider>
              <Navigation />
              {children}
              <AIAssistant />
            </AIAssistantProvider>
          </TooltipProvider>
        </AuthProvider>
        <Toaster />
      </NextIntlClientProvider>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <LocalizedLayout>{children}</LocalizedLayout>
        </Suspense>
      </body>
    </html>
  );
}
