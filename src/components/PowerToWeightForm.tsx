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
  // Initial form values
  const initialValues = {
    weight: "",
    power: "",
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
              label="Vehicle Weight (kg)"
              name="weight"
              placeholder="e.g., 200"
              type="number"
            />

            <FormikField
              label="Engine Power (HP)"
              name="power"
              placeholder="e.g., 68"
              type="number"
            />

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={calculating || !isValid || !dirty}
                className="w-full bg-blue-600 text-white py-4 sm:py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-base transition-colors"
              >
                {calculating
                  ? "Calculating..."
                  : "Calculate Power-to-Weight Ratio"}
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

      {/* Sample Data Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2 text-sm">
          Common Motorcycle Specifications Reference
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Kawasaki Ninja 300: 172kg, 39HP</div>
          <div>• Kawasaki Ninja 650: 193kg, 68HP</div>
          <div>• Honda CBR600RR: 194kg, 118HP</div>
          <div>• Yamaha YZF-R1: 199kg, 200HP</div>
        </div>
      </div>
    </div>
  );
}
