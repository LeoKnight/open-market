"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface COEInfoPanelProps {
  coeExpiryDate?: string | null;
  registrationDate?: string | null;
}

export default function COEInfoPanel({ coeExpiryDate, registrationDate }: COEInfoPanelProps) {
  const t = useTranslations("COEInfo");
  const [coePrice, setCoePrice] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/coe-prices")
      .then((r) => r.json())
      .then((data) => { if (data.category_d) setCoePrice(data.category_d); })
      .catch(() => {});
  }, []);

  if (!coeExpiryDate) return null;

  const expiryDate = new Date(coeExpiryDate);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = 10 * 365;
  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));

  const yearsRemaining = Math.floor(daysRemaining / 365);
  const monthsRemaining = Math.floor((daysRemaining % 365) / 30);

  const coeRemainingValue = coePrice ? Math.round((daysRemaining / totalDays) * coePrice) : null;

  const isExpiringSoon = daysRemaining < 365;
  const isExpired = daysRemaining === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 rounded-lg ${isExpired ? "bg-destructive/10" : isExpiringSoon ? "bg-amber-50" : "bg-primary/5"}`}>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={isExpired ? "destructive" : isExpiringSoon ? "outline" : "secondary"}>
              {isExpired ? t("expired") : t("expiresOn")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {expiryDate.toLocaleDateString("en-SG", { year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
          {!isExpired && (
            <p className={`text-2xl font-bold ${isExpiringSoon ? "text-amber-700" : "text-primary"}`}>
              {yearsRemaining > 0 && `${yearsRemaining}Y `}{monthsRemaining}M {daysRemaining % 30}D
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{t("coeProgress")}</span>
            <span>{progressPercent.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{t("registered")}</span>
            <span>{t("expiry")}</span>
          </div>
        </div>

        <div className="space-y-2">
          {coePrice && (
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {t("currentCOEPrice")}
              </span>
              <span className="text-sm font-semibold">S${coePrice.toLocaleString()}</span>
            </div>
          )}
          {coeRemainingValue != null && (
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-xs text-muted-foreground">{t("remainingValue")}</span>
              <span className="text-sm font-semibold text-green-700">S${coeRemainingValue.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
