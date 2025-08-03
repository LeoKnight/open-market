export interface CostResults {
  omv: number;
  coe: number;
  arf: number;
  exciseDuty: number;
  gst: number;
  registrationFee: number;
  taxableAmount: number;
  totalCost: number;
  breakdown: {
    omv: { label: string; amount: number; percentage: number };
    coe: { label: string; amount: number; percentage: number; note: string };
    arf: { label: string; amount: number; percentage: number; note: string };
    exciseDuty: {
      label: string;
      amount: number;
      percentage: number;
      note: string;
    };
    gst: { label: string; amount: number; percentage: number; note: string };
    registrationFee: { label: string; amount: number; percentage: number };
  };
}

export interface RunningCosts {
  roadTax: number;
  insurance: number;
  maintenance: number;
  total: number;
  breakdown: {
    roadTax: { label: string; amount: number };
    insurance: { label: string; amount: number };
    maintenance: { label: string; amount: number };
  };
}
