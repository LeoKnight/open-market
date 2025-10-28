#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const https = require("https");
const unzipper = require("unzipper");

const coeDataUrl =
  "https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle%20Registration/COE%20Bidding%20Results.zip";

/**
 * Process COE CSV data and filter for motorcycle (Category D) records
 *
 * Usage:
 * node scripts/process-coe-data.js [--download] [input-file] [output-file]
 *
 * Options:
 * --download   Download the latest data from LTA before processing
 *
 * Example:
 * node scripts/process-coe-data.js --download
 * node scripts/process-coe-data.js data/coe_Bidding_Results/M11-coe_results.csv src/data/motorcycle-coe-data.js
 */

// Configuration
const DEFAULT_INPUT_FILE =
  "data/coe_Bidding_Results/Coe Bidding Results/M11-coe_results.csv";
const DEFAULT_OUTPUT_FILE = "src/data/motorcycle-coe-data.js";
const DOWNLOAD_DIR = "data/coe_Bidding_Results";
const ZIP_FILE = path.join(DOWNLOAD_DIR, "COE_Bidding_Results.zip");

// Parse command line arguments
let shouldDownload = false;
let inputFile = DEFAULT_INPUT_FILE;
let outputFile = DEFAULT_OUTPUT_FILE;

const args = process.argv.slice(2);
if (args[0] === "--download") {
  shouldDownload = true;
  inputFile = args[1] || DEFAULT_INPUT_FILE;
  outputFile = args[2] || DEFAULT_OUTPUT_FILE;
} else {
  inputFile = args[0] || DEFAULT_INPUT_FILE;
  outputFile = args[1] || DEFAULT_OUTPUT_FILE;
}

// Main execution
(async function main() {
  try {
    if (shouldDownload) {
      console.log("🌐 Downloading latest COE data from LTA...");
      await downloadFile(coeDataUrl, ZIP_FILE);
      console.log("✅ Download completed");

      console.log("📦 Extracting ZIP file...");
      await extractZip(ZIP_FILE, DOWNLOAD_DIR);
      console.log("✅ Extraction completed");

      // Clean up ZIP file
      if (fs.existsSync(ZIP_FILE)) {
        fs.unlinkSync(ZIP_FILE);
        console.log("🗑️  Cleaned up ZIP file");
      }
    }

    // Process the CSV file
    await processCSV(inputFile, outputFile);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();

/**
 * Download file from URL
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }

    const file = fs.createWriteStream(outputPath);
    let downloadedBytes = 0;
    let lastProgress = 0;

    https
      .get(url, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close();
          fs.unlinkSync(outputPath);
          return downloadFile(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(outputPath);
          return reject(
            new Error(`Failed to download: HTTP ${response.statusCode}`)
          );
        }

        const totalBytes = parseInt(response.headers["content-length"], 10);

        response.on("data", (chunk) => {
          downloadedBytes += chunk.length;
          if (totalBytes) {
            const progress = Math.floor((downloadedBytes / totalBytes) * 100);
            if (progress !== lastProgress && progress % 10 === 0) {
              console.log(
                `   Progress: ${progress}% (${Math.round(
                  downloadedBytes / 1024
                )}KB / ${Math.round(totalBytes / 1024)}KB)`
              );
              lastProgress = progress;
            }
          }
        });

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`   Downloaded: ${Math.round(downloadedBytes / 1024)}KB`);
          resolve();
        });
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        reject(err);
      });

    file.on("error", (err) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(err);
    });
  });
}

/**
 * Extract ZIP file
 */
function extractZip(zipPath, outputDir) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on("entry", (entry) => {
        const fileName = entry.path;
        const fullPath = path.join(outputDir, fileName);

        console.log(`   Extracting: ${fileName}`);

        if (entry.type === "Directory") {
          entry.autodrain();
          return;
        }

        // Create directory if needed
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        entry.pipe(fs.createWriteStream(fullPath));
      })
      .on("close", resolve)
      .on("error", reject);
  });
}

/**
 * Process CSV file
 */
function processCSV(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const motorcycleCOEData = [];

    console.log(`\n🚀 Processing COE data from: ${inputFile}`);
    console.log(`📊 Filtering for Category D (Motorcycles) only`);

    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      return reject(new Error(`Input file '${inputFile}' not found`));
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

        resolve();
      })
      .on("error", (error) => {
        reject(new Error(`Error processing CSV: ${error.message}`));
      });
  });
}

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
