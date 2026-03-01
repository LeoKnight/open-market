"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import ImageUpload from "./ImageUpload";
import DetailCardUpload from "./DetailCardUpload";
import AIListingScore from "./AIListingScore";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Info,
  Gauge,
  DollarSign,
  Phone,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "BMW", "Ducati", "Aprilia",
  "Triumph", "KTM", "Husqvarna", "Harley-Davidson", "Indian", "MV Agusta",
  "CFMoto", "Benelli", "Piaggio", "Vespa", "Other",
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

const LICENSE_CLASSES = [
  { value: "_none", label: "Select License Class" },
  { value: "CLASS_2B", label: "Class 2B (up to 200cc)" },
  { value: "CLASS_2A", label: "Class 2A (up to 400cc)" },
  { value: "CLASS_2", label: "Class 2 (no limit)" },
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
  power?: number | null;
  weight?: number | null;
  torque?: number | null;
  fuelConsumption?: number | null;
  registrationDate?: string | null;
  omv?: number | null;
  coeExpiryDate?: string | null;
  licenseClass?: string | null;
  contactWhatsapp?: string | null;
  contactPhone?: string | null;
}

interface ListingFormProps {
  initialData?: ListingData;
  isEdit?: boolean;
}

const STEPS = [
  { id: "basic", icon: Info, label: "Basic Info" },
  { id: "performance", icon: Gauge, label: "Performance" },
  { id: "pricing", icon: DollarSign, label: "Pricing & Registration" },
  { id: "photos", icon: Camera, label: "Photos" },
  { id: "contact", icon: Phone, label: "Contact" },
];

export default function ListingForm({
  initialData,
  isEdit = false,
}: ListingFormProps) {
  const router = useRouter();
  const t = useTranslations("ListingForm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

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
    power: initialData?.power || 0,
    weight: initialData?.weight || 0,
    torque: initialData?.torque || 0,
    fuelConsumption: initialData?.fuelConsumption || 0,
    registrationDate: initialData?.registrationDate
      ? new Date(initialData.registrationDate).toISOString().split("T")[0]
      : "",
    omv: initialData?.omv || 0,
    coeExpiryDate: initialData?.coeExpiryDate
      ? new Date(initialData.coeExpiryDate).toISOString().split("T")[0]
      : "",
    licenseClass: initialData?.licenseClass || "",
    contactWhatsapp: initialData?.contactWhatsapp || "",
    contactPhone: initialData?.contactPhone || "",
  });

  const locale = useLocale();
  const tAI = useTranslations("AI");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const updateField = (field: string, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const aiGenerate = useCallback(
    async (prompt: string, field: string) => {
      setAiLoading(field);
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            context: { page: "listing-form", locale, formData: form },
          }),
        });
        if (!res.ok) throw new Error("AI error");

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

        return result.trim();
      } catch {
        return null;
      } finally {
        setAiLoading(null);
      }
    },
    [form, locale]
  );

  const handleAITitle = async () => {
    const result = await aiGenerate(
      `Generate a concise, attractive listing title for this motorcycle: ${form.brand} ${form.model} ${form.year}, ${form.engineSize}cc, ${form.mileage}km. Return ONLY the title text, no quotes.`,
      "title"
    );
    if (result) updateField("title", result.replace(/^["']|["']$/g, ""));
  };

  const handleAIDescription = async () => {
    const result = await aiGenerate(
      `Write a compelling motorcycle listing description for: ${form.brand} ${form.model} ${form.year}, ${form.engineSize}cc, ${form.mileage}km, condition: ${form.condition}, power: ${form.power || "N/A"}HP, weight: ${form.weight || "N/A"}kg. Price: S$${form.price || "TBD"}. Location: ${form.location || "Singapore"}. Be professional and highlight key selling points. 3-5 sentences. Return ONLY the description text.`,
      "description"
    );
    if (result) updateField("description", result);
  };

  const handleAIPrice = async () => {
    const result = await aiGenerate(
      `Suggest a fair market price in SGD for this motorcycle: ${form.brand} ${form.model} ${form.year}, ${form.engineSize}cc, ${form.mileage}km, condition: ${form.condition}. Consider Singapore used motorcycle market prices. Return ONLY a number (the suggested price in SGD, no currency symbol, no comma).`,
      "price"
    );
    if (result) {
      const price = parseFloat(result.replace(/[^0-9.]/g, ""));
      if (!isNaN(price) && price > 0) updateField("price", price);
    }
  };

  const handleCardUpload = (data: Record<string, unknown>) => {
    const fieldMap: Record<string, string> = {
      brand: "brand", model: "model", year: "year", engineSize: "engineSize",
      mileage: "mileage", power: "power", weight: "weight", torque: "torque",
      registrationDate: "registrationDate", omv: "omv", coeExpiryDate: "coeExpiryDate",
      type: "type", licenseClass: "licenseClass", condition: "condition",
    };

    setForm((prev) => {
      const updated = { ...prev };
      for (const [key, formKey] of Object.entries(fieldMap)) {
        if (data[key] != null && data[key] !== "") {
          (updated as Record<string, unknown>)[formKey] = data[key];
        }
      }
      return updated;
    });
    setIsVerified(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.brand || !form.model || !form.year || !form.engineSize || !form.price || !form.location) {
      setError(t("fillRequired"));
      setStep(0);
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...form,
        power: form.power || null,
        weight: form.weight || null,
        torque: form.torque || null,
        fuelConsumption: form.fuelConsumption || null,
        registrationDate: form.registrationDate || null,
        omv: form.omv || null,
        coeExpiryDate: form.coeExpiryDate || null,
        licenseClass: form.licenseClass || null,
        contactWhatsapp: form.contactWhatsapp || null,
        contactPhone: form.contactPhone || null,
        isVerified,
      };

      const url = isEdit ? `/api/listings/${initialData?.id}` : "/api/listings";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("saveFailed"));
        return;
      }

      router.push(`/listings/${data.id}`);
      router.refresh();
    } catch {
      setError(t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("basicInfo")}</h3>

            {!isEdit && <DetailCardUpload onExtracted={handleCardUpload} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <Label>{t("title")} <span className="text-destructive">*</span></Label>
                  <AIButton onClick={handleAITitle} loading={aiLoading === "title"} label={tAI("suggestTitle")} disabled={!form.brand && !form.model} />
                </div>
                <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder={t("titlePlaceholder")} required />
              </div>
              <div>
                <Label className="mb-1.5">{t("brand")} <span className="text-destructive">*</span></Label>
                <Select value={form.brand || "_none"} onValueChange={(v) => updateField("brand", v === "_none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder={t("selectBrand")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">{t("selectBrand")}</SelectItem>
                    {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">{t("model")} <span className="text-destructive">*</span></Label>
                <Input value={form.model} onChange={(e) => updateField("model", e.target.value)} placeholder={t("modelPlaceholder")} required />
              </div>
              <div>
                <Label className="mb-1.5">{t("year")} <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.year} onChange={(e) => updateField("year", parseInt(e.target.value))} min={1970} max={new Date().getFullYear() + 1} required />
              </div>
              <div>
                <Label className="mb-1.5">{t("engineSize")} <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.engineSize || ""} onChange={(e) => updateField("engineSize", parseInt(e.target.value) || 0)} placeholder="e.g. 600" min={1} required />
              </div>
              <div>
                <Label className="mb-1.5">{t("mileage")}</Label>
                <Input type="number" value={form.mileage || ""} onChange={(e) => updateField("mileage", parseInt(e.target.value) || 0)} placeholder="e.g. 15000" min={0} />
              </div>
              <div>
                <Label className="mb-1.5">{t("vehicleType")}</Label>
                <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">{t("licenseClass")}</Label>
                <Select value={form.licenseClass || "_none"} onValueChange={(v) => updateField("licenseClass", v === "_none" ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LICENSE_CLASSES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <Label>{t("description")}</Label>
                  <AIButton onClick={handleAIDescription} loading={aiLoading === "description"} label={tAI("generateDescription")} disabled={!form.brand && !form.model} />
                </div>
                <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder={t("descriptionPlaceholder")} rows={4} />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">{t("performanceSpecs")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("performanceOptional")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5">{t("power")}</Label>
                <Input type="number" value={form.power || ""} onChange={(e) => updateField("power", parseInt(e.target.value) || 0)} placeholder="e.g. 100" min={0} />
              </div>
              <div>
                <Label className="mb-1.5">{t("weight")}</Label>
                <Input type="number" value={form.weight || ""} onChange={(e) => updateField("weight", parseInt(e.target.value) || 0)} placeholder="e.g. 200" min={0} />
              </div>
              <div>
                <Label className="mb-1.5">{t("torque")}</Label>
                <Input type="number" value={form.torque || ""} onChange={(e) => updateField("torque", parseFloat(e.target.value) || 0)} placeholder="e.g. 65.7" min={0} step={0.1} />
              </div>
              <div>
                <Label className="mb-1.5">{t("fuelConsumption")}</Label>
                <Input type="number" value={form.fuelConsumption || ""} onChange={(e) => updateField("fuelConsumption", parseFloat(e.target.value) || 0)} placeholder="e.g. 4.5" min={0} step={0.1} />
              </div>
            </div>
            {form.power > 0 && form.weight > 0 && (
              <Alert className="mt-4">
                <AlertDescription>
                  {t("powerToWeightRatio")}: <span className="font-bold">{(form.power / form.weight).toFixed(3)} HP/kg</span>
                  {" - "}
                  {form.power / form.weight >= 1.2 ? "Superbike" :
                   form.power / form.weight >= 0.8 ? "Sport" :
                   form.power / form.weight >= 0.5 ? "Standard" : "Cruiser"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("pricingRegistration")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>{t("price")} <span className="text-destructive">*</span></Label>
                  <AIButton onClick={handleAIPrice} loading={aiLoading === "price"} label={tAI("suggestPrice")} disabled={!form.brand && !form.model} />
                </div>
                <Input type="number" value={form.price || ""} onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)} placeholder="e.g. 8500" min={0} step={0.01} required />
              </div>
              <div>
                <Label className="mb-1.5">{t("condition")}</Label>
                <Select value={form.condition} onValueChange={(v) => updateField("condition", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">{t("omv")}</Label>
                <Input type="number" value={form.omv || ""} onChange={(e) => updateField("omv", parseFloat(e.target.value) || 0)} placeholder="e.g. 7000" min={0} />
                <p className="text-xs text-muted-foreground mt-1">{t("omvHint")}</p>
              </div>
              <div>
                <Label className="mb-1.5">{t("registrationDate")}</Label>
                <Input type="date" value={form.registrationDate} onChange={(e) => updateField("registrationDate", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">{t("coeExpiryDate")}</Label>
                <Input type="date" value={form.coeExpiryDate} onChange={(e) => updateField("coeExpiryDate", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">{t("location")} <span className="text-destructive">*</span></Label>
                <Input value={form.location} onChange={(e) => updateField("location", e.target.value)} placeholder={t("locationPlaceholder")} required />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("photos")}</h3>
            <ImageUpload images={form.images} onChange={(images) => updateField("images", images)} />
          </div>
        );

      case 4:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">{t("contactInfo")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("contactHint")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5">{t("whatsapp")}</Label>
                <Input value={form.contactWhatsapp} onChange={(e) => updateField("contactWhatsapp", e.target.value)} placeholder="+65 9123 4567" />
              </div>
              <div>
                <Label className="mb-1.5">{t("phone")}</Label>
                <Input value={form.contactPhone} onChange={(e) => updateField("contactPhone", e.target.value)} placeholder="+65 9123 4567" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-2">
        <Progress value={((step + 1) / STEPS.length) * 100} className="mb-4" />
      </div>
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((s, i) => (
          <button key={s.id} type="button" onClick={() => setStep(i)}
            className={`flex flex-col items-center gap-1 flex-1 py-2 transition-colors ${
              i === step ? "text-primary" : i < step ? "text-green-600" : "text-muted-foreground"
            }`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
              i === step ? "border-primary bg-primary/10" : i < step ? "border-green-500 bg-green-50" : "border-muted"
            }`}>
              <s.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium hidden sm:block">{s.label}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {step === STEPS.length - 1 && (
        <Alert variant={isVerified ? "default" : "destructive"} className={isVerified ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
          <AlertDescription className="flex items-center gap-2">
            {isVerified ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {tAI("verifiedByAI")}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {tAI("unverifiedHint")}
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4" /> {t("previous")}
        </Button>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("cancel")}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}>
              {t("next")} <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <AIListingScore listingData={form} />
              <Button type="submit" disabled={loading}>
                {loading ? t("saving") : isEdit ? t("updateListing") : t("publishListing")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

function AIButton({
  onClick,
  loading,
  label,
  disabled,
}: {
  onClick: () => void;
  loading: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading || disabled}
      className="h-7 text-xs gap-1"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {label}
    </Button>
  );
}
