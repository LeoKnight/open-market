"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import FuelConsumptionForm, {
  FuelConsumptionValues,
} from "@/components/FuelConsumptionForm";
import FuelConsumptionDisplay from "@/components/FuelConsumptionDisplay";
import {
  convertFromMPG,
  convertFromKmPerLiter,
  convertFromLitersPer100Km,
  FuelConsumptionResults,
} from "@/utils/fuel-conversion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ConversionSource = "mpg" | "kmPerLiter" | "litersPer100Km" | null;

export default function FuelConsumptionConverter() {
  const t = useTranslations("FuelConsumption");
  const [values, setValues] = useState<FuelConsumptionValues>({
    mpg: "",
    kmPerLiter: "",
    litersPer100Km: "",
  });
  const [results, setResults] = useState<FuelConsumptionResults | null>(null);
  const [lastChangedField, setLastChangedField] =
    useState<ConversionSource>(null);

  // 处理值变化
  const handleValueChange = useCallback(
    (newValues: FuelConsumptionValues) => {
      // 找出哪个字段被修改了
      let changedField: ConversionSource = null;
      if (newValues.mpg !== values.mpg) {
        changedField = "mpg";
      } else if (newValues.kmPerLiter !== values.kmPerLiter) {
        changedField = "kmPerLiter";
      } else if (newValues.litersPer100Km !== values.litersPer100Km) {
        changedField = "litersPer100Km";
      }

      setLastChangedField(changedField);
      setValues(newValues);
    },
    [values]
  );

  // 当值改变时自动计算转换
  useEffect(() => {
    if (!lastChangedField) {
      setResults(null);
      return;
    }

    const changedValue = values[lastChangedField];

    // 如果输入为空，清空其他字段
    if (changedValue === "") {
      setValues({
        mpg: "",
        kmPerLiter: "",
        litersPer100Km: "",
      });
      setResults(null);
      setLastChangedField(null);
      return;
    }

    const numValue = parseFloat(changedValue);

    // 验证输入
    if (isNaN(numValue) || numValue <= 0) {
      return;
    }

    // 根据修改的字段进行转换
    let conversionResults: FuelConsumptionResults;

    switch (lastChangedField) {
      case "mpg":
        conversionResults = convertFromMPG(numValue);
        break;
      case "kmPerLiter":
        conversionResults = convertFromKmPerLiter(numValue);
        break;
      case "litersPer100Km":
        conversionResults = convertFromLitersPer100Km(numValue);
        break;
      default:
        return;
    }

    // 更新其他字段（不是正在编辑的字段）
    setValues((prevValues) => ({
      ...prevValues,
      mpg:
        lastChangedField === "mpg"
          ? prevValues.mpg
          : conversionResults.mpg.toFixed(2),
      kmPerLiter:
        lastChangedField === "kmPerLiter"
          ? prevValues.kmPerLiter
          : conversionResults.kmPerLiter.toFixed(2),
      litersPer100Km:
        lastChangedField === "litersPer100Km"
          ? prevValues.litersPer100Km
          : conversionResults.litersPer100Km.toFixed(2),
    }));

    setResults(conversionResults);
  }, [values, lastChangedField]);

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <FuelConsumptionForm
            onValueChange={handleValueChange}
            values={values}
          />

          {/* Results Display */}
          <FuelConsumptionDisplay results={results} />
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {t("aboutTitle")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3 text-lg">
                {t("mpgTitle")}
              </h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• {t("mpgDesc1")}</li>
                <li>• {t("mpgDesc2")}</li>
                <li>• {t("mpgDesc3")}</li>
                <li>• {t("mpgDesc4")}</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3 text-lg">
                {t("kmlTitle")}
              </h4>
              <ul className="text-green-800 text-sm space-y-2">
                <li>• {t("kmlDesc1")}</li>
                <li>• {t("kmlDesc2")}</li>
                <li>• {t("kmlDesc3")}</li>
                <li>• {t("kmlDesc4")}</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3 text-lg">
                {t("l100Title")}
              </h4>
              <ul className="text-purple-800 text-sm space-y-2">
                <li>• {t("l100Desc1")}</li>
                <li>• {t("l100Desc2")}</li>
                <li>• {t("l100Desc3")}</li>
                <li>• {t("l100Desc4")}</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              {t("formulasTitle")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-mono">• km/L = MPG × 0.425144</p>
                <p className="font-mono">• L/100km = 235.214583 ÷ MPG</p>
              </div>
              <div>
                <p className="font-mono">• MPG = km/L ÷ 0.425144</p>
                <p className="font-mono">• L/100km = 100 ÷ km/L</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            💡 {t("usageTips")}
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>{t("tip1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>{t("tip2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>{t("tip3")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>{t("tip4")}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
