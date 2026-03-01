"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { X, Bike, ArrowLeft, Fuel, Bot, Loader2 } from "lucide-react";
import { normalizeImageUrl } from "@/lib/image-url";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface CompareItem {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  image?: string;
}

interface ListingFull {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  engineSize: number;
  mileage: number;
  price: number;
  power?: number | null;
  weight?: number | null;
  torque?: number | null;
  fuelConsumption?: number | null;
  condition: string;
  coeExpiryDate?: string | null;
  images: string[];
}

const COMPARE_KEY = "open-market-compare";
const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

function normalize(value: number, max: number): number {
  return max > 0 ? Math.round((value / max) * 100) : 0;
}

export default function ComparePage() {
  const t = useTranslations("Compare");
  const tAI = useTranslations("AI");
  const locale = useLocale();
  const [items, setItems] = useState<CompareItem[]>([]);
  const [listings, setListings] = useState<ListingFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const stored: CompareItem[] = JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
    setItems(stored);

    if (stored.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(
      stored.map((item) => fetch(`/api/listings/${item.id}`).then((r) => r.json()))
    )
      .then((results) => setListings(results.filter((r: ListingFull) => r.id)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    setListings((prev) => prev.filter((l) => l.id !== id));
    localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("compare-updated"));
  };

  const clearAll = () => {
    setItems([]);
    setListings([]);
    localStorage.setItem(COMPARE_KEY, "[]");
    window.dispatchEvent(new Event("compare-updated"));
  };

  const maxValues = listings.reduce(
    (acc, l) => ({
      price: Math.max(acc.price, l.price),
      engineSize: Math.max(acc.engineSize, l.engineSize),
      power: Math.max(acc.power, l.power || 0),
      weight: Math.max(acc.weight, l.weight || 0),
      torque: Math.max(acc.torque, l.torque || 0),
      mileage: Math.max(acc.mileage, l.mileage),
    }),
    { price: 0, engineSize: 0, power: 0, weight: 0, torque: 0, mileage: 0 }
  );

  const radarData = [
    { subject: t("power") || "Power", ...Object.fromEntries(listings.map((l, i) => [`v${i}`, normalize(l.power || 0, maxValues.power)])) },
    { subject: t("engineSize") || "Engine", ...Object.fromEntries(listings.map((l, i) => [`v${i}`, normalize(l.engineSize, maxValues.engineSize)])) },
    { subject: t("torque") || "Torque", ...Object.fromEntries(listings.map((l, i) => [`v${i}`, normalize(l.torque || 0, maxValues.torque)])) },
    { subject: t("value") || "Value", ...Object.fromEntries(listings.map((l, i) => [`v${i}`, normalize(maxValues.price - l.price + 1, maxValues.price)])) },
    { subject: t("lowMileage") || "Low KM", ...Object.fromEntries(listings.map((l, i) => [`v${i}`, normalize(maxValues.mileage - l.mileage + 1, maxValues.mileage)])) },
  ];

  const getSpecValue = (listing: ListingFull, key: string): string => {
    switch (key) {
      case "price": return `S$${listing.price.toLocaleString()}`;
      case "year": return String(listing.year);
      case "engineSize": return `${listing.engineSize}cc`;
      case "mileage": return `${listing.mileage.toLocaleString()} km`;
      case "power": return listing.power ? `${listing.power} HP` : "-";
      case "weight": return listing.weight ? `${listing.weight} kg` : "-";
      case "torque": return listing.torque ? `${listing.torque} Nm` : "-";
      case "fuelConsumption": return listing.fuelConsumption ? `${listing.fuelConsumption} L/100km` : "-";
      case "_ptw": return listing.power && listing.weight ? `${(listing.power / listing.weight).toFixed(3)}` : "-";
      case "condition": return listing.condition;
      default: return "-";
    }
  };

  const handleAIAnalysis = async () => {
    if (listings.length < 2 || aiLoading) return;
    setAiLoading(true);
    setAiAnalysis("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Compare these motorcycles and provide a detailed analysis with pros/cons for each, and a final recommendation:\n${listings.map((l, i) => `Bike ${i + 1}: ${l.brand} ${l.model} (${l.year}) - ${l.engineSize}cc, ${l.power || "?"}HP, ${l.weight || "?"}kg, ${l.mileage}km, S$${l.price}, condition: ${l.condition}`).join("\n")}`,
            },
          ],
          context: {
            page: "compare",
            locale,
            comparisons: listings.map((l) => ({
              brand: l.brand,
              model: l.model,
              year: l.year,
              engineSize: l.engineSize,
              power: l.power,
              weight: l.weight,
              torque: l.torque,
              mileage: l.mileage,
              price: l.price,
              condition: l.condition,
              fuelConsumption: l.fuelConsumption,
            })),
          },
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
            if (delta) {
              result += delta;
              setAiAnalysis(result);
            }
          } catch {}
        }
      }
    } catch {
      setAiAnalysis("Failed to generate analysis. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const specRows = [
    { label: t("price") || "Price", key: "price" },
    { label: t("year") || "Year", key: "year" },
    { label: t("engine") || "Engine", key: "engineSize" },
    { label: t("mileage") || "Mileage", key: "mileage" },
    { label: t("power") || "Power", key: "power" },
    { label: t("weight") || "Weight", key: "weight" },
    { label: t("torque") || "Torque", key: "torque" },
    { label: t("fuelConsumption") || "Fuel", key: "fuelConsumption" },
    { label: t("powerToWeight") || "HP/kg", key: "_ptw" },
    { label: t("condition") || "Condition", key: "condition" },
  ];

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-2">
              <ArrowLeft className="w-4 h-4" /> {t("backToListings") || "Back"}
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              {t("clearAll")}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">{t("loading") || "Loading..."}</div>
        ) : listings.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent className="pt-6">
              <Bike className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">{t("empty")}</h3>
              <p className="text-muted-foreground mb-6">{t("emptyHint")}</p>
              <Button asChild>
                <Link href="/">
                  {t("browseListings")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Bike Headers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${listings.length}, 1fr)` }}>
              <div />
              {listings.map((l, i) => (
                <Card key={l.id} className="relative">
                  <CardContent className="p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(l.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted mb-3">
                      {l.images[0] ? (
                        <Image src={normalizeImageUrl(l.images[0])} alt={l.title} fill className="object-cover" sizes="300px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Fuel className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Link href={`/listings/${l.id}`} className="text-sm font-semibold text-foreground hover:text-primary line-clamp-2">
                      {l.title}
                    </Link>
                    <p className="text-lg font-bold mt-1" style={{ color: COLORS[i] }}>
                      S${l.price.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Radar Chart */}
            {listings.some((l) => l.power) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("radarTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                      {listings.map((l, i) => (
                        <Radar key={l.id} name={l.brand + " " + l.model} dataKey={`v${i}`}
                          stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                </CardContent>
              </Card>
            )}

            {/* Comparison Table */}
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableBody>
                    {specRows.map((spec) => (
                      <TableRow key={spec.key}>
                        <TableCell className="w-48 font-medium">
                          <Badge variant="secondary">{spec.label}</Badge>
                        </TableCell>
                        {listings.map((l) => (
                          <TableCell key={l.id} className="font-medium">
                            {getSpecValue(l, spec.key)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    {tAI("compareAnalysis")}
                  </CardTitle>
                  <Button
                    onClick={handleAIAnalysis}
                    disabled={aiLoading || listings.length < 2}
                    className="gap-2"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    {aiLoading ? tAI("analyzing") : tAI("generateAnalysis")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
              {aiAnalysis ? (
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiAnalysis}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {tAI("compareAnalysisHint")}
                </p>
              )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
