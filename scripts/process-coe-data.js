#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/**
 * Process COE CSV data and filter for motorcycle (Category D) records
 *
 * Usage:
 * node scripts/process-coe-data.js [input-file] [output-file]
 *
 * Example:
 * node scripts/process-coe-data.js data/coe_Bidding_Results/M11-coe_results.csv src/data/motorcycle-coe-data.js
 */

// Configuration
const DEFAULT_INPUT_FILE = "data/coe_Bidding_Results/M11-coe_results.csv";
const DEFAULT_OUTPUT_FILE = "src/data/motorcycle-coe-data.js";

// Get command line arguments
const inputFile = process.argv[2] || DEFAULT_INPUT_FILE;
const outputFile = process.argv[3] || DEFAULT_OUTPUT_FILE;

// Store processed data
const motorcycleCOEData = [];

console.log(`🚀 Processing COE data from: ${inputFile}`);
console.log(`📊 Filtering for Category D (Motorcycles) only`);

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: Input file '${inputFile}' not found`);
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created output directory: ${outputDir}`);
}

// Process CSV file
fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (row) => {
    // Filter for Category D (Motorcycles) only
    if (row.vehicle_class === "Category D") {
      // Clean and convert data types
      const processedRow = {
        month: row.month.trim(),
        biddingNo: parseInt(row.bidding_no),
        vehicleClass: row.vehicle_class.trim(),
        quota: parseInt(row.quota),
        bidsSuccess: parseInt(row.bids_success),
        bidsReceived: parseInt(row.bids_received),
        premium: parseInt(row.premium),
      };

      // Add derived fields
      processedRow.successRate = (
        (processedRow.bidsSuccess / processedRow.bidsReceived) *
        100
      ).toFixed(2);
      processedRow.oversubscriptionRate = (
        (processedRow.bidsReceived / processedRow.quota) *
        100
      ).toFixed(2);

      motorcycleCOEData.push(processedRow);
    }
  })
  .on("end", () => {
    console.log(
      `✅ Processed ${motorcycleCOEData.length} motorcycle COE records`
    );

    // Sort by month and bidding number
    motorcycleCOEData.sort((a, b) => {
      const monthCompare = a.month.localeCompare(b.month);
      if (monthCompare !== 0) return monthCompare;
      return a.biddingNo - b.biddingNo;
    });

    // Generate JavaScript file content
    const jsContent = generateJavaScriptFile(motorcycleCOEData);

    // Write to output file
    fs.writeFileSync(outputFile, jsContent, "utf8");

    console.log(`💾 Output written to: ${outputFile}`);

    // Display summary statistics
    displaySummary(motorcycleCOEData);
  })
  .on("error", (error) => {
    console.error("❌ Error processing CSV:", error.message);
    process.exit(1);
  });

/**
 * Generate JavaScript file content with the processed data
 */
function generateJavaScriptFile(data) {
  const timestamp = new Date().toISOString();

  return `/**
 * Motorcycle COE (Certificate of Entitlement) Historical Data
 * Category D - Motorcycles
 * 
 * Generated on: ${timestamp}
 * Total records: ${data.length}
 * 
 * Data fields:
 * - month: Bidding month (YYYY-MM format)
 * - biddingNo: Bidding number within the month (1 or 2)
 * - vehicleClass: Always "Category D" for motorcycles
 * - quota: Number of COEs available
 * - bidsSuccess: Number of successful bids
 * - bidsReceived: Total number of bids received
 * - premium: COE price in SGD
 * - successRate: Percentage of successful bids
 * - oversubscriptionRate: Percentage of oversubscription
 */

export const motorcycleCOEHistory = ${JSON.stringify(data, null, 2)};

/**
 * Get the latest COE price for motorcycles
 * @returns {number} Latest COE premium in SGD
 */
export function getLatestCOEPrice() {
  if (motorcycleCOEHistory.length === 0) return 9511; // Fallback
  return motorcycleCOEHistory[motorcycleCOEHistory.length - 1].premium;
}

/**
 * Get COE prices for a specific year
 * @param {string} year - Year in YYYY format
 * @returns {Array} Array of COE records for the specified year
 */
export function getCOEPricesByYear(year) {
  return motorcycleCOEHistory.filter(record => record.month.startsWith(year));
}

/**
 * Get average COE price for a specific year
 * @param {string} year - Year in YYYY format
 * @returns {number} Average COE premium for the year
 */
export function getAverageCOEPrice(year) {
  const yearData = getCOEPricesByYear(year);
  if (yearData.length === 0) return 0;
  
  const sum = yearData.reduce((total, record) => total + record.premium, 0);
  return Math.round(sum / yearData.length);
}

/**
 * Get COE price statistics
 * @returns {Object} Statistics including min, max, average prices
 */
export function getCOEStatistics() {
  if (motorcycleCOEHistory.length === 0) return null;
  
  const prices = motorcycleCOEHistory.map(record => record.premium);
  
  return {
    count: prices.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
    latest: prices[prices.length - 1]
  };
}

export default motorcycleCOEHistory;
`;
}

/**
 * Display summary statistics of the processed data
 */
function displaySummary(data) {
  if (data.length === 0) {
    console.log("⚠️  No data to summarize");
    return;
  }

  const prices = data.map((record) => record.premium);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(
    prices.reduce((sum, price) => sum + price, 0) / prices.length
  );
  const latestPrice = prices[prices.length - 1];

  console.log("\n📈 Summary Statistics:");
  console.log(`   Total records: ${data.length}`);
  console.log(
    `   Date range: ${data[0].month} to ${data[data.length - 1].month}`
  );
  console.log(
    `   Price range: S$${minPrice.toLocaleString()} - S$${maxPrice.toLocaleString()}`
  );
  console.log(`   Average price: S$${avgPrice.toLocaleString()}`);
  console.log(`   Latest price: S$${latestPrice.toLocaleString()}`);

  // Show latest few records
  console.log("\n📋 Latest 5 records:");
  const latest5 = data.slice(-5);
  latest5.forEach((record) => {
    console.log(
      `   ${record.month}-${
        record.biddingNo
      }: S$${record.premium.toLocaleString()} (${record.bidsSuccess}/${
        record.bidsReceived
      } bids)`
    );
  });
}
