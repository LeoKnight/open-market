"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
                  Open-Market
                </h1>
              </Link>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-10 md:flex space-x-8">
              <Link
                href="/depreciation-calculator"
                className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Depreciation Calculator
              </Link>
              <Link
                href="/motorcycle-cost-calculator"
                className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Cost Calculator
              </Link>
            </nav>
          </div>

          {/* Desktop Auth Buttons */}
          {/* <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Sign In
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Sign Up
            </button>
          </div> */}

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
                href="/depreciation-calculator"
                className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              >
                Depreciation Calculator
              </Link>
              <Link
                href="/motorcycle-cost-calculator"
                className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              >
                Cost Calculator
              </Link>

              {/* <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-3 space-x-3">
                  <button className="text-gray-500 hover:text-blue-600 text-base font-medium">
                    Sign In
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700">
                    Sign Up
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
