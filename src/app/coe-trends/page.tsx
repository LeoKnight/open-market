"use client";

import React from "react";
import Link from "next/link";
import COEChart from "@/components/COEChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  motorcycleCOEHistory,
  getCOEStatistics,
} from "@/data/motorcycle-coe-data";

interface COEStatistics {
  count: number;
  min: number;
  max: number;
  average: number;
  latest: number;
}

export default function COETrendsPage() {
  const statistics = getCOEStatistics() as COEStatistics | null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            COE Price Trends
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4 mb-6">
            Historical Certificate of Entitlement prices for motorcycles in
            Singapore
          </p>

          {/* Quick Stats */}
          {/* {statistics && (
            <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    S${statistics.latest.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Latest Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    S${statistics.average.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Average Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    S${statistics.max.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Peak Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {statistics.count}
                  </p>
                  <p className="text-sm text-gray-600">Total Biddings</p>
                </div>
              </div>
            </div>
          )} */}
        </div>

        {/* Chart Component */}
        <COEChart data={motorcycleCOEHistory} />

        {/* Information Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>About COE</CardTitle>
              <CardDescription>
                Understanding Certificate of Entitlement for motorcycles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  What is COE?
                </h4>
                <p className="text-gray-600 text-sm">
                  Certificate of Entitlement (COE) is a quota license that
                  allows vehicle ownership in Singapore for 10 years. For
                  motorcycles, this falls under Category D.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Bidding Process
                </h4>
                <p className="text-gray-600 text-sm">
                  COE bidding occurs twice monthly. The premium is determined by
                  the lowest successful bid when demand meets supply quota.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Price Factors
                </h4>
                <p className="text-gray-600 text-sm">
                  COE prices fluctuate based on quota availability, economic
                  conditions, and market demand for motorcycles.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart Features</CardTitle>
              <CardDescription>
                How to interpret the COE price trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Time Ranges
                </h4>
                <p className="text-gray-600 text-sm">
                  Filter data by different time periods (1Y, 2Y, 5Y, or All) to
                  analyze short-term and long-term trends.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Chart Types
                </h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>
                    • <strong>Line Chart:</strong> Shows price and quota trends
                    separately
                  </li>
                  <li>
                    • <strong>Combined Chart:</strong> Overlays price line on
                    quota bars
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Tooltip Data
                </h4>
                <p className="text-gray-600 text-sm">
                  Hover over data points to see detailed information including
                  success rates and oversubscription levels.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
            <CardDescription>
              Key observations from COE price trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Cyclical Patterns
                </h4>
                <p className="text-blue-800 text-sm">
                  COE prices often show cyclical patterns influenced by economic
                  cycles and government policies affecting vehicle ownership.
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">
                  Quota Impact
                </h4>
                <p className="text-green-800 text-sm">
                  Higher quotas generally lead to lower prices, while restricted
                  supply during certain periods can drive prices significantly
                  higher.
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">
                  Seasonal Trends
                </h4>
                <p className="text-purple-800 text-sm">
                  End-of-year periods often see increased bidding activity as
                  people look to purchase vehicles before year-end.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
