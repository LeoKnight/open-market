"use client";

import { useTranslations } from "next-intl";
import { TrendingDown, TrendingUp, Minus, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { calculateMotorcycleCost } from "@/utils/motorcycle-cost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PriceAnalysisProps {
  price: number;
  omv?: number | null;
  registrationDate?: string | null;
  coeExpiryDate?: string | null;
  coePrice: number | null;
  marketAvgPrice?: number | null;
}

export default function PriceAnalysis({
  price, omv, registrationDate, coeExpiryDate, coePrice, marketAvgPrice,
}: PriceAnalysisProps) {
  const t = useTranslations("PriceAnalysis");

  const coeRemainingDays = coeExpiryDate
    ? Math.max(0, Math.floor((new Date(coeExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const totalCoeDays = 10 * 365;
  const coeRemainingValue = coeRemainingDays != null && coePrice
    ? Math.round((coeRemainingDays / totalCoeDays) * coePrice) : null;

  const regDate = registrationDate ? new Date(registrationDate) : null;
  const monthsUsed = regDate
    ? Math.max(1, Math.floor((Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))) : null;

  const monthlyDepreciation = monthsUsed && coeRemainingValue != null
    ? Math.round((price - coeRemainingValue) / monthsUsed) : null;

  const costBreakdown = omv && coePrice ? calculateMotorcycleCost(omv, coePrice) : null;

  const pieData = costBreakdown ? [
    { name: "OMV", value: costBreakdown.omv },
    { name: "COE", value: costBreakdown.coe },
    { name: "ARF", value: costBreakdown.arf },
    { name: t("exciseDuty"), value: costBreakdown.exciseDuty },
    { name: "GST", value: costBreakdown.gst },
    { name: t("regFee"), value: costBreakdown.registrationFee },
  ] : null;

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280"];

  const priceDiff = marketAvgPrice ? ((price - marketAvgPrice) / marketAvgPrice) * 100 : null;
  const priceLevel = priceDiff != null
    ? priceDiff <= -10 ? "good" : priceDiff <= 10 ? "fair" : "high" : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {coeRemainingValue != null && coeRemainingDays != null && (
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-primary font-medium">{t("coeRemainingValue")}</p>
            <p className="text-xl font-bold text-primary">S${coeRemainingValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {coeRemainingDays} {t("daysRemaining")} ({Math.floor(coeRemainingDays / 365)}{t("years")} {Math.floor((coeRemainingDays % 365) / 30)}{t("months")})
            </p>
          </div>
        )}

        {monthlyDepreciation != null && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-600 font-medium">{t("monthlyDepreciation")}</p>
            <p className="text-xl font-bold text-amber-700">S${monthlyDepreciation.toLocaleString()}/{t("month")}</p>
            {monthsUsed && <p className="text-xs text-amber-500">{t("basedOn")} {monthsUsed} {t("monthsOwnership")}</p>}
          </div>
        )}

        {priceLevel && marketAvgPrice && (
          <div className={`p-3 rounded-lg ${priceLevel === "good" ? "bg-green-50" : priceLevel === "fair" ? "bg-muted" : "bg-destructive/5"}`}>
            <p className="text-xs font-medium mb-1 flex items-center gap-1">
              <Badge variant={priceLevel === "good" ? "default" : priceLevel === "fair" ? "secondary" : "destructive"} className="text-xs">
                {priceLevel === "good" ? <><TrendingDown className="h-3 w-3 mr-1" />{t("belowMarket")}</> :
                 priceLevel === "high" ? <><TrendingUp className="h-3 w-3 mr-1" />{t("aboveMarket")}</> :
                 <><Minus className="h-3 w-3 mr-1" />{t("fairPrice")}</>}
              </Badge>
            </p>
            <p className="text-sm mt-2">
              {t("marketAvg")}: <span className="font-semibold">S${marketAvgPrice.toLocaleString()}</span>
              {priceDiff != null && <span className="ml-1 text-xs">({priceDiff > 0 ? "+" : ""}{priceDiff.toFixed(1)}%)</span>}
            </p>
          </div>
        )}

        {pieData && (
          <div>
            <p className="text-sm font-medium mb-2">{t("newBikeCostBreakdown")}</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `S$${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {t("totalNewCost")}: S${costBreakdown?.totalCost.toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
