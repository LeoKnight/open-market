"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md";
}

export default function VerificationBadge({ isVerified, size = "sm" }: VerificationBadgeProps) {
  const t = useTranslations("AI");

  if (size === "sm") {
    return isVerified ? (
      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
        <ShieldCheck className="h-3 w-3" />
        {t("verified")}
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <ShieldAlert className="h-3 w-3" />
        {t("unverified")}
      </Badge>
    );
  }

  return isVerified ? (
    <Alert className="border-green-200 bg-green-50 text-green-700">
      <ShieldCheck className="h-5 w-5 text-green-600" />
      <AlertDescription>
        <p className="font-medium">{t("verifiedByAI")}</p>
        <p className="text-xs">{t("verifiedDesc")}</p>
      </AlertDescription>
    </Alert>
  ) : (
    <Alert className="border-amber-200 bg-amber-50 text-amber-700">
      <ShieldAlert className="h-5 w-5 text-amber-600" />
      <AlertDescription>
        <p className="font-medium">{t("unverified")}</p>
        <p className="text-xs">{t("unverifiedDesc")}</p>
      </AlertDescription>
    </Alert>
  );
}
