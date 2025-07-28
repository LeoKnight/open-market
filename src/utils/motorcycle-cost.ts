import { calculateARF } from "./arf";

/**
 * Singapore motorcycle cost calculation constants
 */
export const MOTORCYCLE_FEES = {
  GST_RATE: 0.09, // 9% GST (updated rate)
  REGISTRATION_FEE: 220, // Registration fee for motorcycles in SGD
  ROAD_TAX_BASE: 18, // Annual road tax for motorcycles <= 200cc
} as const;

/**
 * Calculate total motorcycle cost breakdown
 *
 * @param omv - Open Market Value in SGD
 * @returns Detailed cost breakdown
 */
export const calculateMotorcycleCost = (omv: number) => {
  if (omv <= 0) {
    throw new Error("OMV must be greater than 0");
  }

  // Calculate ARF
  const arf = calculateARF(omv);

  // Calculate GST on (OMV + ARF)
  const taxableAmount = omv + arf;
  const gst = Math.round(taxableAmount * MOTORCYCLE_FEES.GST_RATE);

  // Registration fee
  const registrationFee = MOTORCYCLE_FEES.REGISTRATION_FEE;

  // Total cost
  const totalCost = omv + arf + gst + registrationFee;

  return {
    omv,
    arf,
    gst,
    registrationFee,
    taxableAmount,
    totalCost,
    breakdown: {
      omv: {
        label: "Open Market Value (OMV)",
        amount: omv,
        percentage: (omv / totalCost) * 100,
      },
      arf: {
        label: "Additional Registration Fee (ARF)",
        amount: arf,
        percentage: (arf / totalCost) * 100,
      },
      gst: {
        label: `Goods & Services Tax (${MOTORCYCLE_FEES.GST_RATE * 100}%)`,
        amount: gst,
        percentage: (gst / totalCost) * 100,
        note: `Applied on OMV + ARF (S$${taxableAmount.toLocaleString()})`,
      },
      registrationFee: {
        label: "Registration Fee",
        amount: registrationFee,
        percentage: (registrationFee / totalCost) * 100,
      },
    },
  };
};

/**
 * Calculate estimated annual running costs for motorcycle
 *
 * @param engineSize - Engine size in cc
 * @returns Annual running costs breakdown
 */
export const calculateAnnualRunningCosts = (engineSize: number = 150) => {
  // Road tax calculation based on engine size
  let roadTax: number = MOTORCYCLE_FEES.ROAD_TAX_BASE;

  if (engineSize > 200) {
    roadTax = Math.round(engineSize * 0.75); // Rough estimate for larger bikes
  }

  const insurance = 800; // Estimated annual insurance
  const maintenance = 600; // Estimated annual maintenance

  return {
    roadTax,
    insurance,
    maintenance,
    total: roadTax + insurance + maintenance,
    breakdown: {
      roadTax: {
        label: "Road Tax (Annual)",
        amount: roadTax,
      },
      insurance: {
        label: "Insurance (Estimated Annual)",
        amount: insurance,
      },
      maintenance: {
        label: "Maintenance (Estimated Annual)",
        amount: maintenance,
      },
    },
  };
};
