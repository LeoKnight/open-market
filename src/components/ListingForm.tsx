"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";

const BRANDS = [
  "Honda",
  "Yamaha",
  "Suzuki",
  "Kawasaki",
  "BMW",
  "Ducati",
  "Aprilia",
  "Triumph",
  "KTM",
  "Husqvarna",
  "Harley-Davidson",
  "Indian",
  "MV Agusta",
  "CFMoto",
  "Benelli",
  "Piaggio",
  "Vespa",
  "Other",
];

const TYPES = [
  { value: "SPORT", label: "Sport" },
  { value: "TOURING", label: "Touring" },
  { value: "CRUISER", label: "Cruiser" },
  { value: "SPORT_TOURING", label: "Sport Touring" },
  { value: "ADVENTURE", label: "Adventure" },
  { value: "NAKED", label: "Naked" },
  { value: "SCOOTER", label: "Scooter" },
  { value: "OTHER", label: "Other" },
];

const CONDITIONS = [
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

interface ListingData {
  id?: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  engineSize: number;
  mileage: number;
  type: string;
  price: number;
  condition: string;
  description: string;
  location: string;
  images: string[];
}

interface ListingFormProps {
  initialData?: ListingData;
  isEdit?: boolean;
}

export default function ListingForm({
  initialData,
  isEdit = false,
}: ListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: initialData?.title || "",
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    year: initialData?.year || new Date().getFullYear(),
    engineSize: initialData?.engineSize || 0,
    mileage: initialData?.mileage || 0,
    type: initialData?.type || "OTHER",
    price: initialData?.price || 0,
    condition: initialData?.condition || "GOOD",
    description: initialData?.description || "",
    location: initialData?.location || "",
    images: initialData?.images || [],
  });

  const updateField = (field: string, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !form.title ||
      !form.brand ||
      !form.model ||
      !form.year ||
      !form.engineSize ||
      !form.price ||
      !form.location
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit
        ? `/api/listings/${initialData?.id}`
        : "/api/listings";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save listing");
        return;
      }

      router.push(`/listings/${data.id}`);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Images */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
        <ImageUpload
          images={form.images}
          onChange={(images) => updateField("images", images)}
        />
      </div>

      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. 2020 Honda CBR600RR - Low Mileage"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              value={form.brand}
              onChange={(e) => updateField("brand", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Brand</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => updateField("model", e.target.value)}
              placeholder="e.g. CBR600RR"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => updateField("year", parseInt(e.target.value))}
              min={1970}
              max={new Date().getFullYear() + 1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engine Size (cc) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.engineSize || ""}
              onChange={(e) =>
                updateField("engineSize", parseInt(e.target.value) || 0)
              }
              placeholder="e.g. 600"
              min={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mileage (km)
            </label>
            <input
              type="number"
              value={form.mileage || ""}
              onChange={(e) =>
                updateField("mileage", parseInt(e.target.value) || 0)
              }
              placeholder="e.g. 15000"
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing & Condition */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Pricing & Condition
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.price || ""}
              onChange={(e) =>
                updateField("price", parseFloat(e.target.value) || 0)
              }
              placeholder="e.g. 8500"
              min={0}
              step={0.01}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              value={form.condition}
              onChange={(e) => updateField("condition", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g. Singapore, Ang Mo Kio"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Description
        </h3>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe your motorcycle - condition, modifications, service history, reason for selling..."
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Saving..."
            : isEdit
              ? "Update Listing"
              : "Publish Listing"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
