"use client";

import { useState, useEffect } from "react";

/**
 * COEPriceDisplay Component
 *
 * A reusable component for displaying COE (Certificate of Entitlement) prices
 * from Singapore's LTA (Land Transport Authority).
 *
 * @example
 * // Basic usage (defaults to motorcycle COE)
 * <COEPriceDisplay onPriceUpdate={(price) => console.log(price)} />
 *
 * @example
 * // For different COE categories
 * <COEPriceDisplay
 *   category="category_a"
 *   title="Car COE Price (1600cc & below)"
 *   onPriceUpdate={(price) => setCoePrice(price)}
 * />
 *
 * @example
 * // With custom styling
 * <COEPriceDisplay
 *   category="category_d"
 *   className="mb-8"
 *   title="Latest Motorcycle COE"
 *   onPriceUpdate={(price) => handlePriceUpdate(price)}
 * />
 */

interface COEPrices {
  category_a: number; // Cars 1600cc & below and taxis
  category_b: number; // Cars above 1600cc
  category_c: number; // Goods vehicles & buses
  category_d: number; // Motorcycles
  category_e: number; // Open category
  error?: string; // Optional error message from API
}

interface COEPriceDisplayProps {
  onPriceUpdate?: (price: number) => void; // Callback when price updates
  category?:
    | "category_a"
    | "category_b"
    | "category_c"
    | "category_d"
    | "category_e";
  title?: string;
  description?: string;
  className?: string;
}

export default function COEPriceDisplay({
  onPriceUpdate,
  category = "category_d", // Default to motorcycles
  title = "Latest Motorcycle COE Price",
  description = "Category D - Motorcycles (from LTA Singapore)",
  className = "",
}: COEPriceDisplayProps) {
  const [coePrice, setCoePrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch COE prices from LTA
  const fetchCOEPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch COE prices from our API endpoint
      const response = await fetch("/api/coe-prices");

      if (!response.ok) {
        throw new Error("Failed to fetch COE prices");
      }

      const data: COEPrices = await response.json();
      const price = data[category];

      setCoePrice(price);

      // Call the callback function if provided
      if (onPriceUpdate) {
        onPriceUpdate(price);
      }

      setError(data.error || null);
    } catch (err) {
      const fallbackPrice = category === "category_d" ? 9511 : 50000; // Different fallbacks for different categories
      const errorMessage = "Failed to fetch COE prices. Using estimated value.";

      setError(errorMessage);
      setCoePrice(fallbackPrice);

      if (onPriceUpdate) {
        onPriceUpdate(fallbackPrice);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCOEPrices();
  }, [category]); // Re-fetch when category changes

  const getCategoryLabel = () => {
    switch (category) {
      case "category_a":
        return "Category A - Cars 1600cc & below";
      case "category_b":
        return "Category B - Cars above 1600cc";
      case "category_c":
        return "Category C - Goods vehicles & buses";
      case "category_d":
        return "Category D - Motorcycles";
      case "category_e":
        return "Category E - Open category";
      default:
        return description;
    }
  };

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-blue-700">
            {getCategoryLabel()}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Results displayed in days for precise calculation
          </p>
        </div>
        <div className="text-left sm:text-right">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-600">Loading...</span>
            </div>
          ) : (
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                S${coePrice?.toLocaleString()}
              </p>
              <button
                onClick={fetchCOEPrices}
                className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 block"
              >
                Refresh Price
              </button>
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
