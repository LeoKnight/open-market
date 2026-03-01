"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { GitCompareArrows, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompareItem {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  image?: string;
}

interface AddToCompareProps {
  listing: CompareItem;
}

const COMPARE_KEY = "open-market-compare";
const MAX_COMPARE = 3;

export default function AddToCompare({ listing }: AddToCompareProps) {
  const t = useTranslations("Compare");
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    const items: CompareItem[] = JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
    setInCompare(items.some((i) => i.id === listing.id));
  }, [listing.id]);

  const toggle = () => {
    const items: CompareItem[] = JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");

    if (inCompare) {
      const updated = items.filter((i) => i.id !== listing.id);
      localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
      setInCompare(false);
    } else {
      if (items.length >= MAX_COMPARE) {
        alert(t("maxCompare", { max: MAX_COMPARE }));
        return;
      }
      items.push(listing);
      localStorage.setItem(COMPARE_KEY, JSON.stringify(items));
      setInCompare(true);
    }

    window.dispatchEvent(new Event("compare-updated"));
  };

  return (
    <Button variant={inCompare ? "secondary" : "outline"} onClick={toggle} className="gap-2">
      {inCompare ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
      {inCompare ? t("inCompare") : t("addToCompare")}
    </Button>
  );
}
