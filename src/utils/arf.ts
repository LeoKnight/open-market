/**
 * Calculate Additional Registration Fee (ARF) based on Open Market Value (OMV)
 *
 * ARF Rate Structure:
 * - First $5,000: 15%
 * - Next $5,000 ($5,001 to $10,000): 50%
 * - Above $10,000: 100%
 *
 * @param omv - Open Market Value in SGD
 * @returns ARF amount in SGD
 */
export const calculateARF = (omv: number): number => {
  if (omv < 0) {
    throw new Error("OMV cannot be negative");
  }

  let arf = 0;

  if (omv <= 5000) {
    // First $5,000: 15%
    arf = omv * 0.15;
  } else if (omv <= 10000) {
    // First $5,000: 15%, Next $5,000: 50%
    arf = 5000 * 0.15 + (omv - 5000) * 0.5;
  } else {
    // First $5,000: 15%, Next $5,000: 50%, Above $10,000: 100%
    arf = 5000 * 0.15 + 5000 * 0.5 + (omv - 10000) * 1.0;
  }

  return Math.round(arf);
};

/**
 * Get ARF breakdown by tiers for transparency
 *
 * @param omv - Open Market Value in SGD
 * @returns Object with ARF breakdown by tiers
 */
export const getARFBreakdown = (omv: number) => {
  if (omv < 0) {
    throw new Error("OMV cannot be negative");
  }

  const breakdown = {
    tier1: { range: "First $5,000", rate: "15%", amount: 0 },
    tier2: { range: "$5,001 - $10,000", rate: "50%", amount: 0 },
    tier3: { range: "Above $10,000", rate: "100%", amount: 0 },
    total: 0,
  };

  if (omv <= 5000) {
    breakdown.tier1.amount = Math.round(omv * 0.15);
  } else if (omv <= 10000) {
    breakdown.tier1.amount = Math.round(5000 * 0.15);
    breakdown.tier2.amount = Math.round((omv - 5000) * 0.5);
  } else {
    breakdown.tier1.amount = Math.round(5000 * 0.15);
    breakdown.tier2.amount = Math.round(5000 * 0.5);
    breakdown.tier3.amount = Math.round((omv - 10000) * 1.0);
  }

  breakdown.total =
    breakdown.tier1.amount + breakdown.tier2.amount + breakdown.tier3.amount;

  return breakdown;
};
