"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motorcycleCOEHistory } from "@/data/motorcycle-coe-data";

interface COEDataPoint {
  month: string;
  biddingNo: number;
  vehicleClass: string;
  quota: number;
  bidsSuccess: number;
  bidsReceived: number;
  premium: number;
  successRate: string;
  oversubscriptionRate: string;
}

interface ChartDataPoint {
  date: string;
  premium: number;
  quota: number;
  bidsReceived: number;
  successRate: number;
  oversubscriptionRate: number;
  period: string;
}

type TimeRange = "1Y" | "2Y" | "5Y" | "10Y" | "ALL";
type ChartType = "line" | "composed";

interface COEChartProps {
  data?: COEDataPoint[];
  className?: string;
}

export default function COEChart({
  data = motorcycleCOEHistory,
  className = "",
}: COEChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("2Y");
  const [chartType, setChartType] = useState<ChartType>("composed");
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 处理和过滤数据 - 使用useMemo优化
  const processedData = useMemo(() => {
    setIsLoading(true);

    const currentYear = new Date().getFullYear();
    const cutoffDate = new Date();

    switch (timeRange) {
      case "1Y":
        cutoffDate.setFullYear(currentYear - 1);
        break;
      case "2Y":
        cutoffDate.setFullYear(currentYear - 2);
        break;
      case "5Y":
        cutoffDate.setFullYear(currentYear - 5);
        break;
      case "10Y":
        cutoffDate.setFullYear(currentYear - 10);
        break;
      default:
        cutoffDate.setFullYear(2000); // Show all data
    }

    const filtered = data
      .filter((item) => {
        const itemDate = new Date(`${item.month}-01`);
        return itemDate >= cutoffDate;
      })
      .map((item) => ({
        date: `${item.month}-${item.biddingNo}`,
        premium: item.premium,
        quota: item.quota,
        bidsReceived: item.bidsReceived,
        successRate: parseFloat(item.successRate),
        oversubscriptionRate: parseFloat(item.oversubscriptionRate),
        period: `${item.month} (${
          item.biddingNo === 1 ? "First" : "Second"
        } Bidding)`,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 显示所有数据点，不进行采样
    const result = filtered;

    // 模拟异步加载以避免阻塞UI
    setTimeout(() => setIsLoading(false), 50);

    return result;
  }, [data, timeRange]);

  // 计算Y轴范围 - 根据当前数据动态调整
  const yAxisDomains = useMemo(() => {
    if (processedData.length === 0)
      return { price: [0, 15000], quota: [0, 1000] };

    const prices = processedData.map((d) => d.premium);
    const quotas = processedData.map((d) => d.quota);

    const priceMin = Math.min(...prices);
    const priceMax = Math.max(...prices);
    const quotaMin = Math.min(...quotas);
    const quotaMax = Math.max(...quotas);

    // 为价格添加10%的缓冲区间
    const priceBuffer = (priceMax - priceMin) * 0.1;
    const priceDomain = [
      Math.max(0, Math.floor(priceMin - priceBuffer)),
      Math.ceil(priceMax + priceBuffer),
    ];

    // 为配额添加15%的缓冲区间
    const quotaBuffer = (quotaMax - quotaMin) * 0.15;
    const quotaDomain = [
      Math.max(0, Math.floor(quotaMin - quotaBuffer)),
      Math.ceil(quotaMax + quotaBuffer),
    ];

    return {
      price: priceDomain,
      quota: quotaDomain,
    };
  }, [processedData]);

  // 计算统计数据 - 使用useMemo优化
  const statistics = useMemo(() => {
    if (processedData.length === 0) return null;

    const prices = processedData.map((d) => d.premium);
    const quotas = processedData.map((d) => d.quota);

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: Math.round(
        prices.reduce((sum, price) => sum + price, 0) / prices.length
      ),
      currentPrice: prices[prices.length - 1],
      totalQuota: quotas.reduce((sum, quota) => sum + quota, 0),
      avgQuota: Math.round(
        quotas.reduce((sum, quota) => sum + quota, 0) / quotas.length
      ),
      priceChange:
        prices.length > 1 ? prices[prices.length - 1] - prices[0] : 0,
      priceChangePercent:
        prices.length > 1
          ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
          : 0,
    };
  }, [processedData]);

  // 计算动态宽度 - 根据数据点数量精确计算
  const dynamicWidth = useMemo(() => {
    const dataLength = processedData.length;
    if (dataLength === 0) return 800;

    // 基础宽度：左右边距 + Y轴宽度
    const baseWidth = 160;

    // 每个数据点的最小宽度（像素）
    const pointWidth =
      dataLength <= 24
        ? 40 // 1年内：每点40px，标签充足
        : dataLength <= 48
        ? 30 // 2年内：每点30px，适中间距
        : dataLength <= 120
        ? 20 // 5年内：每点20px，紧凑显示
        : dataLength <= 240
        ? 15 // 10年内：每点15px，密集显示
        : 12; // 更长时间：每点12px，最密集

    const calculatedWidth = baseWidth + dataLength * pointWidth;

    // 设置最小和最大宽度限制
    const minWidth = 800;
    const maxWidth = isFullscreen ? 4000 : 3000; // 全屏时允许更宽

    return Math.max(minWidth, Math.min(maxWidth, calculatedWidth));
  }, [processedData.length, isFullscreen]);

  // 计算X轴标签间隔 - 根据数据量和可用宽度动态调整
  const xAxisInterval = useMemo(() => {
    const dataLength = processedData.length;
    if (dataLength === 0) return 0;

    // 根据每个数据点的宽度决定标签密度
    const pointWidth = dynamicWidth / dataLength;

    if (pointWidth >= 35) return 0; // 宽度充足，显示所有标签
    if (pointWidth >= 25) return 1; // 每隔1个显示
    if (pointWidth >= 15) return 3; // 每隔3个显示
    if (pointWidth >= 12) return 5; // 每隔5个显示
    return Math.floor(dataLength / 20); // 最密集时保持约20个标签
  }, [processedData.length, dynamicWidth]);

  // 优化的Tooltip组件 - 使用useCallback避免重复渲染
  const CustomTooltip = useCallback(
    ({
      active,
      payload,
    }: {
      active?: boolean;
      payload?: Array<{ payload: ChartDataPoint }>;
    }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
            <p className="font-semibold text-gray-900 mb-2 text-sm">
              {data.period}
            </p>
            <div className="space-y-1 text-xs">
              <p className="text-blue-600">
                <span className="font-medium">COE Price:</span> S$
                {data.premium.toLocaleString()}
              </p>
              <p className="text-green-600">
                <span className="font-medium">Quota:</span>{" "}
                {data.quota.toLocaleString()}
              </p>
              <p className="text-purple-600">
                <span className="font-medium">Bids Received:</span>{" "}
                {data.bidsReceived.toLocaleString()}
              </p>
              <p className="text-orange-600">
                <span className="font-medium">Success Rate:</span>{" "}
                {data.successRate.toFixed(1)}%
              </p>
              <p className="text-red-600">
                <span className="font-medium">Oversubscription:</span>{" "}
                {data.oversubscriptionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        );
      }
      return null;
    },
    []
  );

  // 优化按钮点击处理
  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type);
  }, []);

  // 全屏切换功能
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // ESC键退出全屏
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // 防止背景滚动
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  return (
    <div
      className={`space-y-6 ${className} ${
        isFullscreen ? "fixed inset-0 z-50 bg-white p-4 overflow-auto" : ""
      }`}
    >
      {/* 统计卡片 */}
      {statistics && !isFullscreen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Price</CardDescription>
              <CardTitle className="text-2xl">
                S${statistics.currentPrice.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-sm ${
                  statistics.priceChange >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {statistics.priceChange >= 0 ? "+" : ""}S$
                {statistics.priceChange.toLocaleString()}(
                {statistics.priceChangePercent >= 0 ? "+" : ""}
                {statistics.priceChangePercent.toFixed(1)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Price Range</CardDescription>
              <CardTitle className="text-lg">
                S${statistics.minPrice.toLocaleString()} - S$
                {statistics.maxPrice.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Average: S${statistics.avgPrice.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Quota</CardDescription>
              <CardTitle className="text-2xl">
                {statistics.totalQuota.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Avg per bidding: {statistics.avgQuota.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Data Points</CardDescription>
              <CardTitle className="text-2xl">{processedData.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Bidding sessions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            Time Range:
          </span>
          {(["1Y", "2Y", "5Y", "10Y", "ALL"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeRangeChange(range)}
              disabled={isLoading}
            >
              {range === "ALL" ? "All" : range}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            Chart Type:
          </span>
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => handleChartTypeChange("line")}
            disabled={isLoading}
          >
            Line Chart
          </Button>
          <Button
            variant={chartType === "composed" ? "default" : "outline"}
            size="sm"
            onClick={() => handleChartTypeChange("composed")}
            disabled={isLoading}
          >
            Combined Chart
          </Button>
        </div>
      </div>

      {/* 图表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                COE Price Trend - Category D (Motorcycles)
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center gap-2"
              title={
                isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"
              }
            >
              {isFullscreen ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Exit
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  Fullscreen
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            Historical COE prices with quota information (
            {timeRange === "ALL" ? "All time" : `Last ${timeRange}`})
            <span className="text-blue-600 ml-2">
              • Showing all {processedData.length} bidding sessions (
              {Math.round(processedData.length / 2)} months)
            </span>
            {process.env.NODE_ENV === "development" &&
              processedData.length > 0 && (
                <span className="text-gray-500 ml-2">
                  • Chart width: {dynamicWidth}px (
                  {Math.round(dynamicWidth / processedData.length)}px per point)
                </span>
              )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`w-full overflow-x-auto ${
              isFullscreen ? "h-[calc(100vh-300px)]" : "h-96"
            }`}
          >
            <div className="h-full" style={{ minWidth: `${dynamicWidth}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      interval={xAxisInterval}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      yAxisId="price"
                      orientation="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `S$${value.toLocaleString()}`}
                      domain={yAxisDomains.price}
                    />
                    <YAxis
                      yAxisId="quota"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                      domain={yAxisDomains.quota}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="premium"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false} // 禁用点以提高性能
                      activeDot={{ r: 4, stroke: "#2563eb", strokeWidth: 2 }}
                      name="COE Price (S$)"
                    />
                    <Line
                      yAxisId="quota"
                      type="monotone"
                      dataKey="quota"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={false} // 禁用点以提高性能
                      activeDot={{ r: 4, stroke: "#16a34a", strokeWidth: 2 }}
                      name="Quota"
                    />
                  </LineChart>
                ) : (
                  <ComposedChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      interval={xAxisInterval}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      yAxisId="price"
                      orientation="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `S$${value.toLocaleString()}`}
                      domain={yAxisDomains.price}
                    />
                    <YAxis
                      yAxisId="quota"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                      domain={yAxisDomains.quota}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      yAxisId="quota"
                      dataKey="quota"
                      fill="#22c55e"
                      fillOpacity={0.3}
                      name="Quota"
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="premium"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={false} // 禁用点以提高性能
                      activeDot={{ r: 4, stroke: "#2563eb", strokeWidth: 2 }}
                      name="COE Price (S$)"
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          {/* Mobile scroll hint */}
          <div className="mt-2 md:hidden">
            <p className="text-xs text-gray-500 text-center">
              💡 Swipe left/right to see more data points
            </p>
          </div>
          {/* Fullscreen hint */}
          {isFullscreen && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 text-center">
                Press{" "}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd>{" "}
                to exit fullscreen
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
