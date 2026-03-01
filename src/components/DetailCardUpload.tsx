"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload, ScanLine, CheckCircle, AlertCircle, Loader2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DetailCardUploadProps {
  onExtracted: (data: Record<string, unknown>) => void;
}

export default function DetailCardUpload({ onExtracted }: DetailCardUploadProps) {
  const t = useTranslations("AI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

  const isValidFile = (file: File) =>
    file.type.startsWith("image/") || file.type === "application/pdf";

  const processFile = async (file: File) => {
    setError("");
    setSuccess(false);
    setLoading(true);

    const filePdf = file.type === "application/pdf";
    setIsPdf(filePdf);

    if (!filePdf) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(file.name);
    }

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      });

      if (!res.ok) throw new Error("Failed to process file");

      const result = await res.json();
      if (result.data) {
        onExtracted(result.data);
        setSuccess(true);
      } else {
        setError(t("ocrFailed"));
      }
    } catch {
      setError(t("ocrFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidFile(file)) { setError(t("fileTypeError")); return; }
    if (file.size > 10 * 1024 * 1024) { setError(t("fileTooLarge")); return; }
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) processFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setIsPdf(false);
    setSuccess(false);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="mb-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
          loading ? "border-primary/50 bg-primary/5"
          : success ? "border-green-300 bg-green-50"
          : error ? "border-destructive/50 bg-destructive/5"
          : "border-border hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        <input ref={fileRef} type="file" accept={ACCEPTED_TYPES.join(",")} onChange={handleFileChange} className="hidden" />

        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearPreview}
            className="absolute top-2 right-2 h-7 w-7 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center gap-4">
          {preview && !isPdf ? (
            <img src={preview} alt="Card preview" className="w-20 h-20 object-cover rounded-lg border" />
          ) : preview && isPdf ? (
            <div className="w-20 h-20 bg-red-50 rounded-lg border flex flex-col items-center justify-center gap-1">
              <FileText className="h-7 w-7 text-red-500" />
              <span className="text-[10px] text-muted-foreground truncate max-w-[72px]">PDF</span>
            </div>
          ) : (
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <ScanLine className="h-7 w-7 text-primary" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-0.5">{t("uploadCard")}</h4>
            <p className="text-xs text-muted-foreground mb-2">{t("uploadCardDesc")}</p>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("analyzing")}
              </div>
            ) : success ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                {t("ocrSuccess")}
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            ) : (
              <Button type="button" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                {t("selectFile")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {!preview && !loading && (
        <p className="text-xs text-muted-foreground mt-1.5 text-center">{t("orFillManually")}</p>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
