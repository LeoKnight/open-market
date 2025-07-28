"use client";

import { useState, useCallback, memo } from "react";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  calculateMotorcycleCost,
  calculateAnnualRunningCosts,
} from "@/utils/motorcycle-cost";

interface CostResults {
  omv: number;
  arf: number;
  gst: number;
  registrationFee: number;
  taxableAmount: number;
  totalCost: number;
  breakdown: {
    omv: { label: string; amount: number; percentage: number };
    arf: { label: string; amount: number; percentage: number };
    gst: { label: string; amount: number; percentage: number; note: string };
    registrationFee: { label: string; amount: number; percentage: number };
  };
}

interface RunningCosts {
  roadTax: number;
  insurance: number;
  maintenance: number;
  total: number;
  breakdown: {
    roadTax: { label: string; amount: number };
    insurance: { label: string; amount: number };
    maintenance: { label: string; amount: number };
  };
}

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
    .max(2000, "Engine size must be less than 2000cc"),
});

export default function MotorcycleCostCalculator() {
  const [results, setResults] = useState<CostResults | null>(null);
  const [runningCosts, setRunningCosts] = useState<RunningCosts | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial form values
  const initialValues = {
    omv: "",
    engineSize: "150",
  };

  // Handle form submission
  const handleSubmit = useCallback((values: typeof initialValues) => {
    setCalculating(true);

    try {
      const omv = parseFloat(values.omv);
      const engineSize = parseFloat(values.engineSize);

      // Calculate costs
      const costResults = calculateMotorcycleCost(omv);
      const annualCosts = calculateAnnualRunningCosts(engineSize);

      setResults(costResults);
      setRunningCosts(annualCosts);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Error calculating costs. Please check your inputs.");
    } finally {
      setCalculating(false);
    }
  }, []);

  const resetCalculator = useCallback(() => {
    setResults(null);
    setRunningCosts(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="text-xl sm:text-2xl font-bold text-blue-600"
                >
                  MotoMarket
                </Link>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-10 md:flex space-x-8">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Home
                </Link>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Buy Motorcycles
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Sell Motorcycles
                </a>
                <Link
                  href="/depreciation-calculator"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Depreciation Calculator
                </Link>
                <a
                  href="/motorcycle-cost-calculator"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Cost Calculator
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Financing
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Help Center
                </a>
              </nav>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Sign In
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Sign Up
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                >
                  Home
                </Link>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                >
                  Buy Motorcycles
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                >
                  Sell Motorcycles
                </a>
                <Link
                  href="/depreciation-calculator"
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                >
                  Depreciation Calculator
                </Link>
                <a
                  href="/motorcycle-cost-calculator"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium bg-blue-50"
                >
                  Cost Calculator
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                >
                  Financing
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                >
                  Help Center
                </a>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-3 space-x-3">
                    <button className="text-gray-500 hover:text-blue-600 text-base font-medium">
                      Sign In
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700">
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Motorcycle Cost Calculator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
            Calculate the total cost of purchasing a motorcycle in Singapore
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Motorcycle Information
            </h2>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
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
                        resetCalculator();
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

          {/* Purchase Cost Results */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Purchase Cost Breakdown
            </h2>

            {!results ? (
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <p className="text-sm">
                  Enter motorcycle details to see cost breakdown
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Total Cost Display */}
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Total Purchase Cost
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    S${results.totalCost.toLocaleString()}
                  </p>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  {Object.entries(results.breakdown).map(([key, item]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.label}
                        </p>
                        {"note" in item && (
                          <p className="text-xs text-gray-500">{item.note}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          S${item.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Running Costs */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Estimated Annual Costs
            </h2>

            {!runningCosts ? (
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">
                  Calculate costs to see annual expenses
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Total Annual Cost */}
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-600 font-medium mb-1">
                    Total Annual Running Cost
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    S${runningCosts.total.toLocaleString()}
                  </p>
                </div>

                {/* Running Cost Breakdown */}
                <div className="space-y-3">
                  {Object.entries(runningCosts.breakdown).map(([key, item]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold">
                        S${item.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500 mt-4 p-3 bg-yellow-50 rounded">
                  <strong>Note:</strong> Annual costs are estimates and may vary
                  based on usage, insurance provider, and maintenance needs.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Understanding Motorcycle Costs in Singapore
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                Purchase Costs
              </h4>
              <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
                <li>
                  • <strong>OMV:</strong> Open Market Value - the base price of
                  the motorcycle
                </li>
                <li>
                  • <strong>ARF:</strong> Additional Registration Fee based on
                  OMV tiers
                </li>
                <li>
                  • <strong>GST:</strong> 9% Goods & Services Tax on OMV + ARF
                </li>
                <li>
                  • <strong>Registration Fee:</strong> One-time fee to register
                  the motorcycle
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                Ongoing Costs
              </h4>
              <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
                <li>
                  • <strong>Road Tax:</strong> Annual fee based on engine size
                </li>
                <li>
                  • <strong>Insurance:</strong> Mandatory third-party and
                  optional comprehensive
                </li>
                <li>
                  • <strong>Maintenance:</strong> Regular servicing, repairs,
                  and consumables
                </li>
                <li>
                  • <strong>Fuel:</strong> Not included - varies by usage
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
