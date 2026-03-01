"use client";

import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Label htmlFor={name} className="mb-2">{label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="pr-20"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
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
    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      onValueChange({ ...values, [name]: value });
    }
  };

  const handleReset = () => {
    onValueChange({ mpg: "", kmPerLiter: "", litersPer100Km: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Any Value</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <InputField label="Miles Per Gallon (MPG)" name="mpg" value={values.mpg} onChange={handleInputChange} placeholder="e.g., 35" unit="MPG" />
          <InputField label="Kilometers Per Liter" name="kmPerLiter" value={values.kmPerLiter} onChange={handleInputChange} placeholder="e.g., 15" unit="km/L" />
          <InputField label="Liters Per 100 Kilometers" name="litersPer100Km" value={values.litersPer100Km} onChange={handleInputChange} placeholder="e.g., 6.5" unit="L/100km" />
        </div>
        <Button type="button" variant="secondary" className="w-full mt-6" onClick={handleReset}>
          Reset All Values
        </Button>
      </CardContent>
    </Card>
  );
}
