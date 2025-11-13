"use client";

import { memo, useState } from "react";

export interface FuelConsumptionValues {
  mpg: string;
  kmPerLiter: string;
  litersPer100Km: string;
}

interface FuelConsumptionFormProps {
  onValueChange: (values: FuelConsumptionValues) => void;
  values: FuelConsumptionValues;
}

const InputField = memo(
  ({
    label,
    name,
    value,
    onChange,
    placeholder,
    unit,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder: string;
    unit: string;
  }) => (
    <div className="mb-6">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md px-3 py-3 pr-20 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
          {unit}
        </span>
      </div>
    </div>
  )
);

InputField.displayName = "InputField";

export default function FuelConsumptionForm({
  onValueChange,
  values,
}: FuelConsumptionFormProps) {
  const handleInputChange = (name: string, value: string) => {
    // 只允许有效的数字输入
    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      onValueChange({
        ...values,
        [name]: value,
      });
    }
  };

  const handleReset = () => {
    onValueChange({
      mpg: "",
      kmPerLiter: "",
      litersPer100Km: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Enter Any Value
      </h2>

      <div className="space-y-2">
        <InputField
          label="Miles Per Gallon (MPG)"
          name="mpg"
          value={values.mpg}
          onChange={handleInputChange}
          placeholder="e.g., 35"
          unit="MPG"
        />

        <InputField
          label="Kilometers Per Liter"
          name="kmPerLiter"
          value={values.kmPerLiter}
          onChange={handleInputChange}
          placeholder="e.g., 15"
          unit="km/L"
        />

        <InputField
          label="Liters Per 100 Kilometers"
          name="litersPer100Km"
          value={values.litersPer100Km}
          onChange={handleInputChange}
          placeholder="e.g., 6.5"
          unit="L/100km"
        />
      </div>

      <button
        type="button"
        onClick={handleReset}
        className="w-full mt-6 bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-300 text-base transition-colors"
      >
        Reset All Values
      </button>
    </div>
  );
}

