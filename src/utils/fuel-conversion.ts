// 燃油消耗转换工具函数

export interface FuelConsumptionResults {
  mpg: number;
  kmPerLiter: number;
  litersPer100Km: number;
}

/**
 * 从 MPG (英里每加仑) 转换到其他单位
 */
export function convertFromMPG(mpg: number): FuelConsumptionResults {
  const kmPerLiter = mpg * 0.425144;
  const litersPer100Km = 235.214583 / mpg;

  return {
    mpg,
    kmPerLiter,
    litersPer100Km,
  };
}

/**
 * 从 km/L (公里每升) 转换到其他单位
 */
export function convertFromKmPerLiter(kmPerLiter: number): FuelConsumptionResults {
  const mpg = kmPerLiter / 0.425144;
  const litersPer100Km = 100 / kmPerLiter;

  return {
    mpg,
    kmPerLiter,
    litersPer100Km,
  };
}

/**
 * 从 L/100km (每100公里消耗的升数) 转换到其他单位
 */
export function convertFromLitersPer100Km(litersPer100Km: number): FuelConsumptionResults {
  const mpg = 235.214583 / litersPer100Km;
  const kmPerLiter = 100 / litersPer100Km;

  return {
    mpg,
    kmPerLiter,
    litersPer100Km,
  };
}

/**
 * 格式化数字到指定小数位
 */
export function formatFuelValue(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

