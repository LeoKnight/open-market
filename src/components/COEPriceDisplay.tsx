"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface COEPrices {
  category_a: number;
  category_b: number;
  category_c: number;
  category_d: number;
  category_e: number;
  error?: string;
}

interface COEPriceDisplayProps {
  onPriceUpdate?: (price: number) => void;
  category?: "category_a" | "category_b" | "category_c" | "category_d" | "category_e";
  title?: string;
  description?: string;
  className?: string;
}

export default function COEPriceDisplay({
  onPriceUpdate,
  category = "category_d",
  title,
  description,
  className = "",
}: COEPriceDisplayProps) {
  const t = useTranslations("CoePriceDisplay");
  const tCommon = useTranslations("Common");
  const [coePrice, setCoePrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCOEPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/coe-prices");
      if (!response.ok) throw new Error("Failed to fetch COE prices");

      const data: COEPrices = await response.json();
      const price = data[category];
      setCoePrice(price);
      if (onPriceUpdate) onPriceUpdate(price);
      setError(data.error || null);
    } catch {
      const fallbackPrice = category === "category_d" ? 9511 : 50000;
      setError(t("fetchError"));
      setCoePrice(fallbackPrice);
      if (onPriceUpdate) onPriceUpdate(fallbackPrice);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCOEPrices(); }, [category]);

  const getCategoryLabel = () => {
    switch (category) {
      case "category_a": return t("categoryA");
      case "category_b": return t("categoryB");
      case "category_c": return t("categoryC");
      case "category_d": return t("categoryD");
      case "category_e": return t("categoryE");
      default: return description ?? t("description");
    }
  };

  return (
    <Card className={`bg-primary/5 border-primary/20 ${className}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-base sm:text-lg font-semibold mb-2">{title ?? t("title")}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{getCategoryLabel()}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("precisionNote")}</p>
          </div>
          <div className="text-left sm:text-right">
            {loading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-primary">S${coePrice?.toLocaleString()}</p>
                <Button variant="link" size="sm" onClick={fetchCOEPrices} className="p-0 h-auto">
                  {t("refreshPrice")}
                </Button>
              </div>
            )}
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4 bg-amber-50 border-amber-200 text-amber-700">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
