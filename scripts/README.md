# COE数据处理脚本

这个Node.js脚本用于处理新加坡COE（车辆拥有证）的CSV数据，过滤出摩托车（Category D）的记录并转换为JavaScript数组格式。

## 功能特点

- ✅ 过滤Category D（摩托车）数据
- ✅ 数据类型转换和清理
- ✅ 添加派生字段（成功率、超额认购率）
- ✅ 生成带有工具函数的JavaScript文件
- ✅ 显示统计摘要信息

## 安装依赖

```bash
npm install csv-parser
```

## 使用方法

### 基本用法

```bash
# 使用默认路径
npm run process-coe

# 或直接运行脚本
node scripts/process-coe-data.js
```

### 自定义输入输出文件

```bash
# 指定输入文件
node scripts/process-coe-data.js data/coe_Bidding_Results/M11-coe_results.csv

# 指定输入和输出文件
node scripts/process-coe-data.js input.csv output.js
```

## 输入格式

CSV文件应包含以下列：
- `month`: 月份 (YYYY-MM)
- `bidding_no`: 竞标次数 (1或2)
- `vehicle_class`: 车辆类别 (Category A/B/C/D/E)
- `quota`: 配额数量
- `bids_success`: 成功竞标数
- `bids_received`: 总竞标数
- `premium`: COE价格

## 输出格式

生成的JavaScript文件包含：

### 数据数组
```javascript
export const motorcycleCOEHistory = [
  {
    month: "2010-01",
    biddingNo: 1,
    vehicleClass: "Category D",
    quota: 373,
    bidsSuccess: 365,
    bidsReceived: 509,
    premium: 889,
    successRate: "71.71",
    oversubscriptionRate: "136.46"
  },
  // ... 更多记录
];
```

### 工具函数
```javascript
// 获取最新COE价格
getLatestCOEPrice()

// 获取指定年份的COE价格
getCOEPricesByYear("2024")

// 获取年平均价格
getAverageCOEPrice("2024")

// 获取统计信息
getCOEStatistics()
```

## 生成的统计信息

脚本会显示以下统计信息：
- 总记录数
- 日期范围
- 价格范围（最低/最高）
- 平均价格
- 最新价格
- 最近5条记录

## 示例输出

```
🚀 Processing COE data from: data/coe_Bidding_Results/M11-coe_results.csv
📊 Filtering for Category D (Motorcycles) only
✅ Processed 24 motorcycle COE records
💾 Output written to: src/data/motorcycle-coe-data.js

📈 Summary Statistics:
   Total records: 24
   Date range: 2010-01 to 2010-12
   Price range: S$801 - S$1,389
   Average price: S$1,089
   Latest price: S$1,234

📋 Latest 5 records:
   2010-11-1: S$1,189 (367/523 bids)
   2010-11-2: S$1,234 (378/542 bids)
   2010-12-1: S$1,156 (361/498 bids)
   2010-12-2: S$1,289 (374/567 bids)
```

## 文件结构

```
scripts/
├── process-coe-data.js    # 主脚本文件
└── README.md             # 说明文档

data/
└── coe_Bidding_Results/
    └── M11-coe_results.csv  # 输入CSV文件

src/
└── data/
    └── motorcycle-coe-data.js  # 生成的输出文件
```

## 错误处理

脚本会处理以下错误情况：
- 输入文件不存在
- CSV解析错误
- 输出目录创建失败
- 数据格式问题

## 注意事项

1. 确保CSV文件格式正确且包含必要的列
2. 脚本只处理`vehicle_class`为"Category D"的记录
3. 输出目录会自动创建（如果不存在）
4. 生成的JavaScript文件使用ES6模块语法 