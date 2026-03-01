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
  omv: Yup.number()
    .required("OMV is required")
    .positive("OMV must be positive")
    .min(1000, "OMV must be at least S$1,000")
    .max(100000, "OMV must be less than S$100,000"),
  engineSize: Yup.number()
    .positive("Engine size must be positive")
    .min(50, "Engine size must be at least 50cc")
    .max(3000, "Engine size must be less than 2000cc"),
});

interface MotorcycleFormProps {
  onSubmit: (values: { omv: string; engineSize: string }) => void;
  onReset: () => void;
  calculating: boolean;
}

export default function MotorcycleForm({
  onSubmit,
  onReset,
  calculating,
}: MotorcycleFormProps) {
  const initialValues = { omv: "", engineSize: "150" };

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
              <FormikField label="Open Market Value (OMV) - S$" name="omv" placeholder="e.g., 15000" type="number" />
              <FormikField label="Engine Size (cc)" name="engineSize" placeholder="e.g., 150" type="number" />

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={calculating || !isValid || !dirty} className="w-full">
                  {calculating ? "Calculating..." : "Calculate Cost"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => { resetForm(); onReset(); }}
                >
                  Reset
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
