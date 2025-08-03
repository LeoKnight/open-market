"use client";

import { memo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Formik Field Component
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
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <ErrorMessage
        name={name}
        component="div"
        className="mt-1 text-sm text-red-600"
      />
    </div>
  )
);

FormikField.displayName = "FormikField";

// Validation Schema
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
  // Initial form values
  const initialValues = {
    omv: "",
    engineSize: "150",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Motorcycle Information
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ isValid, dirty, resetForm }) => (
          <Form className="space-y-4 sm:space-y-6">
            <FormikField
              label="Open Market Value (OMV) - S$"
              name="omv"
              placeholder="e.g., 15000"
              type="number"
            />

            <FormikField
              label="Engine Size (cc)"
              name="engineSize"
              placeholder="e.g., 150"
              type="number"
            />

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={calculating || !isValid || !dirty}
                className="w-full bg-blue-600 text-white py-4 sm:py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-base transition-colors"
              >
                {calculating ? "Calculating..." : "Calculate Cost"}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onReset();
                }}
                className="w-full bg-gray-200 text-gray-700 py-4 sm:py-3 px-4 rounded-md font-medium hover:bg-gray-300 text-base transition-colors"
              >
                Reset
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
