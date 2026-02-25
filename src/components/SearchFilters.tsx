"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

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
  { value: "", label: "Any Price" },
  { value: "0-3000", label: "Under $3,000" },
  { value: "3000-8000", label: "$3,000 - $8,000" },
  { value: "8000-15000", label: "$8,000 - $15,000" },
  { value: "15000-30000", label: "$15,000 - $30,000" },
  { value: "30000-", label: "Over $30,000" },
];

const ENGINE_RANGES = [
  { value: "", label: "Any Engine" },
  { value: "0-125", label: "Under 125cc" },
  { value: "125-250", label: "125 - 250cc" },
  { value: "250-400", label: "250 - 400cc" },
  { value: "400-650", label: "400 - 650cc" },
  { value: "650-1000", label: "650 - 1000cc" },
  { value: "1000-", label: "Over 1000cc" },
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
  };
}

export default function SearchFilters({
  brands,
  currentFilters,
}: SearchFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentFilters.search || "");

  const currentPrice =
    currentFilters.minPrice || currentFilters.maxPrice
      ? `${currentFilters.minPrice || "0"}-${currentFilters.maxPrice || ""}`
      : "";

  const currentEngine =
    currentFilters.minEngine || currentFilters.maxEngine
      ? `${currentFilters.minEngine || "0"}-${currentFilters.maxEngine || ""}`
      : "";

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

    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  const handleBrandChange = (brand: string) => {
    router.push(buildUrl({ brand }));
  };

  const handleTypeChange = (type: string) => {
    router.push(buildUrl({ type }));
  };

  const handlePriceChange = (range: string) => {
    const [min, max] = range.split("-");
    router.push(buildUrl({ minPrice: min || "", maxPrice: max || "" }));
  };

  const handleEngineChange = (range: string) => {
    const [min, max] = range.split("-");
    router.push(buildUrl({ minEngine: min || "", maxEngine: max || "" }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ search }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, model, or keyword..."
            className="flex-1 px-5 py-4 text-gray-900 text-base focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <select
          value={currentFilters.brand || "all"}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 [&>option]:text-gray-900"
        >
          <option value="all">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.type || "all"}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 [&>option]:text-gray-900"
        >
          {MOTORCYCLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={currentPrice}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 [&>option]:text-gray-900"
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          value={currentEngine}
          onChange={(e) => handleEngineChange(e.target.value)}
          className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 [&>option]:text-gray-900"
        >
          {ENGINE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
