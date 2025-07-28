import { NextResponse } from "next/server";

// LTA DataMall API endpoint for COE prices
const LTA_API_URL =
  "https://datamall2.mytransport.sg/ltaodataservice/v3/COETransactions";

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
    // Note: In production, you would need to:
    // 1. Register for LTA DataMall API key
    // 2. Add the API key to environment variables
    // 3. Use the actual API endpoint

    // For demo purposes, we'll simulate the API call with mock data
    // Uncomment the following lines when you have a real API key:
    /*
    const response = await fetch(LTA_API_URL, {
      headers: {
        'AccountKey': process.env.LTA_API_KEY || '',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch COE data from LTA');
    }
    
    const data: LTAResponse = await response.json();
    */

    // Mock COE data based on recent Singapore COE prices
    const currentData = {
      category_a: 95000, // Cars 1600cc & below and taxis
      category_b: 115000, // Cars above 1600cc
      category_c: 78000, // Goods vehicles & buses
      category_d: 9511, // Motorcycles
      category_e: 116000, // Open category
      last_updated: new Date().toISOString(),
      source: "LTA DataMall (simulated)",
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
