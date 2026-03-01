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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: t("title"),
    description: t("description"),
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
