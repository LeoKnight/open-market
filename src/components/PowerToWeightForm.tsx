"use client";

import { memo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FormikField = memo(
  ({
    label,
    name,
    placeholder,
    type = "text",
  }: {
    label: string;
    name: string;
    placeholder?: string;
    type?: string;
  }) => (
    <div>
      <Label htmlFor={name} className="mb-2">{label}</Label>
      <Field as={Input} id={name} name={name} type={type} placeholder={placeholder} />
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-destructive" />
    </div>
  )
);

FormikField.displayName = "FormikField";

const validationSchema = Yup.object({
  weight: Yup.number()
    .required("Weight is required")
    .positive("Weight must be positive")
    .min(50, "Weight cannot be less than 50kg")
    .max(1000, "Weight cannot exceed 1000kg"),
  power: Yup.number()
    .required("Power is required")
    .positive("Power must be positive")
    .min(5, "Power cannot be less than 5HP")
    .max(500, "Power cannot exceed 500HP"),
});

interface PowerToWeightFormProps {
  onSubmit: (values: { weight: string; power: string }) => void;
  onReset: () => void;
  calculating: boolean;
}

export default function PowerToWeightForm({
  onSubmit,
  onReset,
  calculating,
}: PowerToWeightFormProps) {
  const initialValues = { weight: "", power: "" };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Motorcycle Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({ isValid, dirty, resetForm }) => (
            <Form className="space-y-6">
              <FormikField label="Vehicle Weight (kg)" name="weight" placeholder="e.g., 200" type="number" />
              <FormikField label="Engine Power (HP)" name="power" placeholder="e.g., 68" type="number" />

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={calculating || !isValid || !dirty} className="w-full">
                  {calculating ? "Calculating..." : "Calculate Power-to-Weight Ratio"}
                </Button>
                <Button type="button" variant="secondary" className="w-full" onClick={() => { resetForm(); onReset(); }}>
                  Reset
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Common Motorcycle Specifications Reference</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Kawasaki Ninja 300: 172kg, 39HP</div>
            <div>Kawasaki Ninja 650: 193kg, 68HP</div>
            <div>Honda CBR600RR: 194kg, 118HP</div>
            <div>Yamaha YZF-R1: 199kg, 200HP</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
