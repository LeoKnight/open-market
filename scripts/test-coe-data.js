#!/usr/bin/env node

// Import the generated COE data (using require for Node.js compatibility)
const fs = require("fs");
const path = require("path");

// Read the generated file and convert to CommonJS for testing
const dataFile = path.join(__dirname, "../src/data/motorcycle-coe-data.js");

if (!fs.existsSync(dataFile)) {
  console.error("❌ COE data file not found. Run process-coe-data.js first.");
  process.exit(1);
}

// Simple test by executing the file content and extracting data
const fileContent = fs.readFileSync(dataFile, "utf8");

// Convert ES6 exports to CommonJS for testing
let testContent = fileContent
  .replace(
    /export const motorcycleCOEHistory = /g,
    "const motorcycleCOEHistory = "
  )
  .replace(/export function/g, "function")
  .replace(/export default motorcycleCOEHistory;/g, "");

// Add return statement
testContent += `
return {
  motorcycleCOEHistory,
  getLatestCOEPrice,
  getCOEPricesByYear,
  getAverageCOEPrice,
  getCOEStatistics
};
`;

// Execute in function context
const coeData = new Function(testContent)();

console.log("🧪 Testing generated COE data...\n");

// Test 1: Data integrity
console.log("📊 Data Integrity Tests:");
console.log(`   Total records: ${coeData.motorcycleCOEHistory.length}`);
console.log(
  `   All Category D: ${
    coeData.motorcycleCOEHistory.every((r) => r.vehicleClass === "Category D")
      ? "✅"
      : "❌"
  }`
);
console.log(
  `   Valid premiums: ${
    coeData.motorcycleCOEHistory.every((r) => r.premium > 0) ? "✅" : "❌"
  }`
);
console.log(
  `   Chronological order: ${
    isChronological(coeData.motorcycleCOEHistory) ? "✅" : "❌"
  }`
);

// Test 2: Utility functions
console.log("\n🛠️  Utility Function Tests:");
const latestPrice = coeData.getLatestCOEPrice();
console.log(`   Latest COE price: S$${latestPrice.toLocaleString()}`);

const stats = coeData.getCOEStatistics();
console.log(
  `   Statistics: Min S$${stats.min.toLocaleString()}, Max S$${stats.max.toLocaleString()}, Avg S$${stats.average.toLocaleString()}`
);

const year2024Data = coeData.getCOEPricesByYear("2024");
console.log(`   2024 records: ${year2024Data.length}`);

if (year2024Data.length > 0) {
  const avg2024 = coeData.getAverageCOEPrice("2024");
  console.log(`   2024 average: S$${avg2024.toLocaleString()}`);
}

// Test 3: Sample data validation
console.log("\n🔍 Sample Data Validation:");
const firstRecord = coeData.motorcycleCOEHistory[0];
const lastRecord =
  coeData.motorcycleCOEHistory[coeData.motorcycleCOEHistory.length - 1];

console.log(
  `   First record: ${firstRecord.month}-${firstRecord.biddingNo}, S$${firstRecord.premium}`
);
console.log(
  `   Last record: ${lastRecord.month}-${lastRecord.biddingNo}, S$${lastRecord.premium}`
);

// Test 4: Data consistency checks
console.log("\n✅ Data Consistency Checks:");
const inconsistentRecords = coeData.motorcycleCOEHistory.filter((record) => {
  return (
    record.bidsSuccess > record.bidsReceived ||
    record.bidsSuccess > record.quota ||
    parseFloat(record.successRate) > 100 ||
    parseFloat(record.oversubscriptionRate) < 0
  );
});

console.log(
  `   Inconsistent records: ${
    inconsistentRecords.length === 0
      ? "✅ None"
      : `❌ ${inconsistentRecords.length} found`
  }`
);

if (inconsistentRecords.length > 0) {
  console.log("   Issues found:");
  inconsistentRecords.slice(0, 3).forEach((record) => {
    console.log(
      `     ${record.month}-${record.biddingNo}: ${record.bidsSuccess}/${record.bidsReceived} bids`
    );
  });
}

// Test 5: Price trend analysis
console.log("\n📈 Price Trend Analysis:");
const recentYears = ["2023", "2024", "2025"];
recentYears.forEach((year) => {
  const yearData = coeData.getCOEPricesByYear(year);
  if (yearData.length > 0) {
    const avgPrice = coeData.getAverageCOEPrice(year);
    const minPrice = Math.min(...yearData.map((r) => r.premium));
    const maxPrice = Math.max(...yearData.map((r) => r.premium));
    console.log(
      `   ${year}: ${
        yearData.length
      } records, Avg S$${avgPrice.toLocaleString()}, Range S$${minPrice.toLocaleString()}-S$${maxPrice.toLocaleString()}`
    );
  }
});

console.log("\n🎉 Testing completed!");

// Helper function to check chronological order
function isChronological(data) {
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];

    if (prev.month > curr.month) return false;
    if (prev.month === curr.month && prev.biddingNo > curr.biddingNo)
      return false;
  }
  return true;
}
