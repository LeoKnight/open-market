import { NextResponse } from "next/server";
import { getLatestCOEPrice } from "@/data/motorcycle-coe-data.js";

// LTA DataMall API endpoint for COE prices

interface COEData {
  category: string;
  price: number;
  date: string;
}

interface LTAResponse {
  odata: {
    metadata: string;
  };
  value: Array<{
    month: string;
    vehicle_class: string;
    current_bids_received: number;
    current_coe_price: number;
    current_coe_qty: number;
    current_coe_reserved_quota: number;
  }>;
}

export async function GET() {
  try {
    // Get the latest COE price from our historical data
    const latestCOEPrice = getLatestCOEPrice();

    // Return current COE data using latest price from historical data
    const currentData = {
      category_a: 95000, // Cars 1600cc & below and taxis
      category_b: 115000, // Cars above 1600cc
      category_c: 78000, // Goods vehicles & buses
      category_d: latestCOEPrice, // Motorcycles - using latest actual price
      category_e: 116000, // Open category
      last_updated: new Date().toISOString(),
      source: "Historical COE data",
    };

    return NextResponse.json(currentData);
  } catch (error) {
    console.error("Error fetching COE prices:", error);

    // Return fallback data in case of error
    return NextResponse.json(
      {
        category_a: 95000,
        category_b: 115000,
        category_c: 78000,
        category_d: 9511,
        category_e: 116000,
        last_updated: new Date().toISOString(),
        source: "Fallback data",
        error: "Unable to fetch live data",
      },
      { status: 200 }
    );
  }
}
