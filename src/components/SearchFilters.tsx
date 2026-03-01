"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOTORCYCLE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "SPORT", label: "Sport" },
  { value: "TOURING", label: "Touring" },
  { value: "CRUISER", label: "Cruiser" },
  { value: "SPORT_TOURING", label: "Sport Touring" },
  { value: "ADVENTURE", label: "Adventure" },
  { value: "NAKED", label: "Naked" },
  { value: "SCOOTER", label: "Scooter" },
  { value: "OTHER", label: "Other" },
];

const PRICE_RANGES = [
  { value: "_all", label: "Any Price" },
  { value: "0-3000", label: "< $3,000" },
  { value: "3000-8000", label: "$3K - $8K" },
  { value: "8000-15000", label: "$8K - $15K" },
  { value: "15000-30000", label: "$15K - $30K" },
  { value: "30000-", label: "> $30,000" },
];

const ENGINE_RANGES = [
  { value: "_all", label: "Any Engine" },
  { value: "0-125", label: "< 125cc" },
  { value: "125-250", label: "125-250cc" },
  { value: "250-400", label: "250-400cc" },
  { value: "400-650", label: "400-650cc" },
  { value: "650-1000", label: "650-1000cc" },
  { value: "1000-", label: "> 1000cc" },
];

const LICENSE_CLASSES = [
  { value: "all", label: "All Classes" },
  { value: "CLASS_2B", label: "Class 2B" },
  { value: "CLASS_2A", label: "Class 2A" },
  { value: "CLASS_2", label: "Class 2" },
];

const SORT_OPTIONS = [
  { value: "_latest", label: "Latest" },
  { value: "price_asc", label: "Price: Low" },
  { value: "price_desc", label: "Price: High" },
  { value: "mileage_asc", label: "Mileage: Low" },
  { value: "views_desc", label: "Most Viewed" },
];

interface SearchFiltersProps {
  brands: string[];
  currentFilters: {
    brand?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    minEngine?: string;
    maxEngine?: string;
    search?: string;
    licenseClass?: string;
    sort?: string;
  };
}

export default function SearchFilters({ brands, currentFilters }: SearchFiltersProps) {
  const router = useRouter();
  const t = useTranslations("Home");
  const tAI = useTranslations("AI");
  const locale = useLocale();
  const [search, setSearch] = useState(currentFilters.search || "");
  const [aiSearching, setAiSearching] = useState(false);

  const currentPrice = currentFilters.minPrice || currentFilters.maxPrice
    ? `${currentFilters.minPrice || "0"}-${currentFilters.maxPrice || ""}` : "_all";
  const currentEngine = currentFilters.minEngine || currentFilters.maxEngine
    ? `${currentFilters.minEngine || "0"}-${currentFilters.maxEngine || ""}` : "_all";

  const buildUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { ...currentFilters, ...updates };
    if (merged.brand && merged.brand !== "all") params.set("brand", merged.brand);
    if (merged.type && merged.type !== "all") params.set("type", merged.type);
    if (merged.minPrice) params.set("minPrice", merged.minPrice);
    if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
    if (merged.minEngine) params.set("minEngine", merged.minEngine);
    if (merged.maxEngine) params.set("maxEngine", merged.maxEngine);
    if (merged.search) params.set("search", merged.search);
    if (merged.licenseClass && merged.licenseClass !== "all") params.set("licenseClass", merged.licenseClass);
    if (merged.sort) params.set("sort", merged.sort);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  const handleFilter = (field: string, value: string) => {
    if (field === "price") {
      if (value === "_all") {
        router.push(buildUrl({ minPrice: "", maxPrice: "" }));
      } else {
        const [min, max] = value.split("-");
        router.push(buildUrl({ minPrice: min || "", maxPrice: max || "" }));
      }
    } else if (field === "engine") {
      if (value === "_all") {
        router.push(buildUrl({ minEngine: "", maxEngine: "" }));
      } else {
        const [min, max] = value.split("-");
        router.push(buildUrl({ minEngine: min || "", maxEngine: max || "" }));
      }
    } else if (field === "sort") {
      router.push(buildUrl({ sort: value === "_latest" ? "" : value }));
    } else {
      router.push(buildUrl({ [field]: value }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ search }));
  };

  const handleAISearch = async () => {
    if (!search.trim() || aiSearching) return;
    setAiSearching(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Convert this natural language motorcycle search query into structured filters. Query: "${search}"\n\nReturn ONLY a JSON object with these optional fields:\n{"brand":"string","type":"SPORT|TOURING|CRUISER|SPORT_TOURING|ADVENTURE|NAKED|SCOOTER|OTHER","minPrice":"number","maxPrice":"number","minEngine":"number","maxEngine":"number","licenseClass":"CLASS_2B|CLASS_2A|CLASS_2","sort":"price_asc|price_desc|mileage_asc|views_desc","search":"keyword"}\n\nUse null for fields that cannot be determined. Return ONLY JSON.`,
            },
          ],
          context: { page: "search", locale },
        }),
      });

      if (!res.ok) throw new Error();

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) result += delta;
          } catch {}
        }
      }

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const filters = JSON.parse(jsonMatch[0]);
        const updates: Record<string, string> = {};
        if (filters.brand) updates.brand = filters.brand;
        if (filters.type) updates.type = filters.type;
        if (filters.minPrice) updates.minPrice = String(filters.minPrice);
        if (filters.maxPrice) updates.maxPrice = String(filters.maxPrice);
        if (filters.minEngine) updates.minEngine = String(filters.minEngine);
        if (filters.maxEngine) updates.maxEngine = String(filters.maxEngine);
        if (filters.licenseClass) updates.licenseClass = filters.licenseClass;
        if (filters.sort) updates.sort = filters.sort;
        if (filters.search) updates.search = filters.search;
        router.push(buildUrl(updates));
      }
    } catch {
      router.push(buildUrl({ search }));
    } finally {
      setAiSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex items-center bg-background rounded-lg shadow-lg overflow-hidden border">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder") || "Search by brand, model, or keyword..."}
            className="flex-1 border-0 h-12 text-base focus-visible:ring-0 rounded-none"
          />
          <Button
            type="button"
            onClick={handleAISearch}
            disabled={aiSearching || !search.trim()}
            size="icon"
            className="h-12 w-12 rounded-none bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            title={tAI("smartSearch")}
          >
            {aiSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </Button>
          <Button type="submit" size="icon" className="h-12 w-12 rounded-none">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <Select value={currentFilters.brand || "all"} onValueChange={(v) => handleFilter("brand", v)}>
          <SelectTrigger className="bg-white/10 backdrop-blur-sm text-white border-white/20 [&>span]:truncate">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={currentFilters.type || "all"} onValueChange={(v) => handleFilter("type", v)}>
          <SelectTrigger className="bg-white/10 backdrop-blur-sm text-white border-white/20 [&>span]:truncate">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {MOTORCYCLE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={currentPrice} onValueChange={(v) => handleFilter("price", v)}>
          <SelectTrigger className="bg-white/10 backdrop-blur-sm text-white border-white/20 [&>span]:truncate">
            <SelectValue placeholder="Any Price" />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={currentEngine} onValueChange={(v) => handleFilter("engine", v)}>
          <SelectTrigger className="bg-white/10 backdrop-blur-sm text-white border-white/20 [&>span]:truncate">
            <SelectValue placeholder="Any Engine" />
          </SelectTrigger>
          <SelectContent>
            {ENGINE_RANGES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={currentFilters.licenseClass || "all"} onValueChange={(v) => handleFilter("licenseClass", v)}>
          <SelectTrigger className="bg-white/10 backdrop-blur-sm text-white border-white/20 [&>span]:truncate">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            {LICENSE_CLASSES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={currentFilters.sort || "_latest"} onValueChange={(v) => handleFilter("sort", v)}>
          <SelectTrigger className="bg-white/10 backdrop-blur-sm text-white border-white/20 [&>span]:truncate">
            <SelectValue placeholder="Latest" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
