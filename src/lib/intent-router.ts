import type { AIContext } from "./ai";

export type IntentType =
  | "regulation"
  | "listing"
  | "market"
  | "tool"
  | "general";

export interface ClassifiedIntent {
  type: IntentType;
  confidence: number;
  category?: string;
  keywords: string[];
}

const REGULATION_KEYWORDS: Record<string, string[]> = {
  registration: [
    "coe",
    "拥车证",
    "certificate of entitlement",
    "bidding",
    "竞标",
    "quota",
    "配额",
    "registration",
    "注册",
    "register",
  ],
  taxes: [
    "road tax",
    "路税",
    "arf",
    "additional registration fee",
    "附加注册费",
    "parf",
    "omv",
    "open market value",
    "erp",
    "电子道路收费",
    "gst",
  ],
  traffic: [
    "dips",
    "记分",
    "demerit",
    "speeding",
    "超速",
    "fine",
    "罚款",
    "penalty",
    "处罚",
    "red light",
    "闯红灯",
    "drunk driving",
    "酒驾",
    "speed limit",
    "限速",
  ],
  licensing: [
    "licence",
    "license",
    "驾照",
    "class 2b",
    "class 2a",
    "class 2",
    "class 3",
    "btt",
    "ftt",
    "riding test",
    "考试",
    "probation",
    "试用期",
  ],
  insurance: [
    "insurance",
    "保险",
    "tpo",
    "tpft",
    "comprehensive",
    "ncd",
    "no-claim",
    "无索赔",
    "premium",
    "保费",
  ],
  "import-export": [
    "import",
    "进口",
    "export",
    "出口",
    "deregistration",
    "注销",
    "parallel import",
    "平行进口",
  ],
  emissions: [
    "ves",
    "emission",
    "排放",
    "eeai",
    "cves",
    "electric vehicle",
    "电动车",
    "ev",
    "charging",
    "充电",
    "green",
    "环保",
  ],
  motorcycle: [
    "motorcycle regulation",
    "摩托车法规",
    "helmet",
    "头盔",
    "pillion",
    "载客",
    "lane splitting",
    "modification",
    "改装",
    "reflective",
    "反光",
  ],
};

const MARKET_KEYWORDS = [
  "price",
  "价格",
  "pricing",
  "定价",
  "how much",
  "多少钱",
  "worth",
  "值",
  "market",
  "市场",
  "trend",
  "趋势",
  "popular",
  "热门",
  "recommend",
  "推荐",
  "budget",
  "预算",
  "depreciation",
  "折旧",
  "cost",
  "成本",
  "买",
  "buy",
  "sell",
  "卖",
];

const TOOL_KEYWORDS = [
  "calculate",
  "计算",
  "search",
  "搜索",
  "find",
  "找",
  "compare",
  "对比",
  "比较",
  "latest coe",
  "最新coe",
  "current",
  "当前",
  "look up",
  "查询",
  "查",
];

export function classifyIntent(
  query: string,
  context?: AIContext
): ClassifiedIntent {
  const queryLower = query.toLowerCase();

  if (context?.listing) {
    return {
      type: "listing",
      confidence: 0.9,
      keywords: [],
    };
  }

  let bestRegCategory = "";
  let bestRegScore = 0;
  const regKeywords: string[] = [];

  for (const [category, keywords] of Object.entries(REGULATION_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (queryLower.includes(kw.toLowerCase())) {
        score += kw.length;
        regKeywords.push(kw);
      }
    }
    if (score > bestRegScore) {
      bestRegScore = score;
      bestRegCategory = category;
    }
  }

  let marketScore = 0;
  const marketKws: string[] = [];
  for (const kw of MARKET_KEYWORDS) {
    if (queryLower.includes(kw.toLowerCase())) {
      marketScore += kw.length;
      marketKws.push(kw);
    }
  }

  let toolScore = 0;
  const toolKws: string[] = [];
  for (const kw of TOOL_KEYWORDS) {
    if (queryLower.includes(kw.toLowerCase())) {
      toolScore += kw.length;
      toolKws.push(kw);
    }
  }

  if (bestRegScore >= 3 && bestRegScore >= marketScore) {
    return {
      type: "regulation",
      confidence: Math.min(bestRegScore / 15, 1),
      category: bestRegCategory,
      keywords: regKeywords,
    };
  }

  if (toolScore >= 4 && toolScore > marketScore * 0.8) {
    return {
      type: "tool",
      confidence: Math.min(toolScore / 12, 1),
      keywords: toolKws,
    };
  }

  if (marketScore >= 3) {
    return {
      type: "market",
      confidence: Math.min(marketScore / 12, 1),
      keywords: marketKws,
    };
  }

  if (bestRegScore > 0) {
    return {
      type: "regulation",
      confidence: Math.min(bestRegScore / 15, 0.5),
      category: bestRegCategory,
      keywords: regKeywords,
    };
  }

  return {
    type: "general",
    confidence: 0.5,
    keywords: [],
  };
}
