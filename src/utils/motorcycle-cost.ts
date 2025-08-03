import { calculateARF } from "./arf";

/**
 * Singapore motorcycle cost calculation constants
 * Based on Singapore Customs regulations
 */
export const MOTORCYCLE_FEES = {
  EXCISE_DUTY_RATE: 0.12, // 12% Excise duty on OMV
  GST_RATE: 0.09, // 9% GST on (OMV + Excise Duty)
  REGISTRATION_FEE: 350, // Registration fee for motorcycles in SGD
  ROAD_TAX_BASE: 18, // Annual road tax for motorcycles <= 200cc
} as const;

/**
 * Calculate total motorcycle cost breakdown according to Singapore regulations
 *
 * Formula:
 * - OMV: Open Market Value (includes purchase price, freight, insurance, handling, etc.)
 * - COE: Certificate of Entitlement (current market price)
 * - ARF: Additional Registration Fee (tiered based on OMV)
 * - Excise Duty: 12% of OMV
 * - GST: 9% of (OMV + Excise Duty) - excludes ARF
 * - Registration Fee: Fixed amount
 *
 * @param omv - Open Market Value in SGD
 * @param coePrice - Current COE price in SGD (optional, defaults to 9511)
 * @returns Detailed cost breakdown
 */
export const calculateMotorcycleCost = (
  omv: number,
  coePrice: number = 9511
) => {
  if (omv <= 0) {
    throw new Error("OMV must be greater than 0");
  }

  if (coePrice < 0) {
    throw new Error("COE price cannot be negative");
  }

  // Calculate ARF (Additional Registration Fee)
  const arf = calculateARF(omv);

  // Calculate Excise Duty (12% of OMV)
  const exciseDuty = Math.round(omv * MOTORCYCLE_FEES.EXCISE_DUTY_RATE);

  // Calculate GST (9% of OMV + Excise Duty, excludes ARF)
  const gstTaxableAmount = omv + exciseDuty;
  const gst = Math.round(gstTaxableAmount * MOTORCYCLE_FEES.GST_RATE);

  // Registration fee
  const registrationFee = MOTORCYCLE_FEES.REGISTRATION_FEE;

  // Total cost (now includes COE)
  const totalCost = omv + coePrice + arf + exciseDuty + gst + registrationFee;

  return {
    omv,
    coe: coePrice,
    arf,
    exciseDuty,
    gst,
    registrationFee,
    taxableAmount: gstTaxableAmount,
    totalCost,
    breakdown: {
      omv: {
        label: "Open Market Value (OMV)",
        amount: omv,
        percentage: (omv / totalCost) * 100,
      },
      coe: {
        label: "Certificate of Entitlement (COE)",
        amount: coePrice,
        percentage: (coePrice / totalCost) * 100,
        note: `Current market price for Category D motorcycles`,
      },
      arf: {
        label: "Additional Registration Fee (ARF)",
        amount: arf,
        percentage: (arf / totalCost) * 100,
        note: `Tiered rates: 15% (first $5K), 50% ($5K-$10K), 100% (above $10K)`,
      },
      exciseDuty: {
        label: `Excise Duty (${MOTORCYCLE_FEES.EXCISE_DUTY_RATE * 100}%)`,
        amount: exciseDuty,
        percentage: (exciseDuty / totalCost) * 100,
        note: `Applied on OMV (S$${omv.toLocaleString()})`,
      },
      gst: {
        label: `Goods & Services Tax (${MOTORCYCLE_FEES.GST_RATE * 100}%)`,
        amount: gst,
        percentage: (gst / totalCost) * 100,
        note: `Applied on OMV + Excise Duty (S$${gstTaxableAmount.toLocaleString()}) - excludes ARF`,
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
