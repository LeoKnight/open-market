"use client";

import { useState, useEffect, useCallback } from "react";
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

type ConversionSource = "mpg" | "kmPerLiter" | "litersPer100Km" | null;

export default function FuelConsumptionConverter() {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fuel Consumption Converter
          </h1>
          <p className="text-xl text-gray-600">
            Easily convert between MPG, km/L, and L/100km
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
            About Fuel Consumption Units
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3 text-lg">
                MPG (Miles Per Gallon)
              </h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• Primarily used in the United States</li>
                <li>• Measures miles traveled per gallon of fuel</li>
                <li>• Higher values indicate better fuel efficiency</li>
                <li>• Typical range: 20-60 MPG</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3 text-lg">
                km/L (Kilometers Per Liter)
              </h4>
              <ul className="text-green-800 text-sm space-y-2">
                <li>• Widely used in Asian regions</li>
                <li>• Measures kilometers traveled per liter of fuel</li>
                <li>• Higher values indicate better fuel efficiency</li>
                <li>• Typical range: 8-25 km/L</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3 text-lg">
                L/100km (Liters Per 100 Kilometers)
              </h4>
              <ul className="text-purple-800 text-sm space-y-2">
                <li>• Used in Europe and Canada</li>
                <li>• Measures liters consumed per 100 kilometers</li>
                <li>• Lower values indicate better fuel efficiency</li>
                <li>• Typical range: 4-12 L/100km</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Conversion Formulas
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
            💡 Usage Tips
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>
                Enter a value in any input field, and the other two units will
                be automatically calculated and displayed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>
                All calculation results are rounded to two decimal places for
                precision
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                Click the &quot;Reset All Values&quot; button to clear all
                inputs and results
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>
                Suitable for comparing fuel efficiency across cars, motorcycles,
                and other vehicles
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
