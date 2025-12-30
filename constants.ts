
import { FoodItem, DailyItems, CookingMethod, MealTemplate, FoodCategory } from './types';
import {
  DAIRY_EXCHANGE,
  MEAT_EXCHANGE,
  STAPLE_EXCHANGE,
  VEGETABLE_EXCHANGE,
  FRUIT_EXCHANGE,
  FAT_EXCHANGE,
  getExchangeValue
} from './constants/exchangeConstants';

/**
 * 初始食物資料庫
 * 依據衛生福利部國民健康署 2019.5 版「食物代換表」
 */
export const INITIAL_FOODS: FoodItem[] = [
  // ============= 乳品類 =============
  // 1份 = 240ml
  {
    id: 'dairy-full-1', name: '全脂鮮乳', portionSize: 240, portionUnit: 'ml',
    caloriesPerPortion: 150, proteinPerPortion: 8, carbsPerPortion: 12, fatPerPortion: 8,
    category: 'dairy', fatLevel: 'full'
  },
  {
    id: 'dairy-low-1', name: '低脂鮮乳', portionSize: 240, portionUnit: 'ml',
    caloriesPerPortion: 120, proteinPerPortion: 8, carbsPerPortion: 12, fatPerPortion: 4,
    category: 'dairy', fatLevel: 'low'
  },
  {
    id: 'dairy-skim-1', name: '脫脂鮮乳', portionSize: 240, portionUnit: 'ml',
    caloriesPerPortion: 80, proteinPerPortion: 8, carbsPerPortion: 12, fatPerPortion: 0,
    category: 'dairy', fatLevel: 'skim'
  },
  {
    id: 'dairy-low-2', name: '無糖優格', portionSize: 210, portionUnit: 'g',
    caloriesPerPortion: 120, proteinPerPortion: 8, carbsPerPortion: 12, fatPerPortion: 4,
    category: 'dairy', fatLevel: 'low'
  },

  // ============= 豆魚蛋肉類 - 低脂 =============
  // 1份 = 35g (雞胸肉) / 30g (魚肉)
  {
    id: 'meat-low-1', name: '雞胸肉', portionSize: 35, portionUnit: 'g',
    caloriesPerPortion: 55, proteinPerPortion: 7, carbsPerPortion: 0, fatPerPortion: 3,
    category: 'meat', fatLevel: 'low'
  },
  {
    id: 'meat-low-2', name: '魚肉(白身)', portionSize: 35, portionUnit: 'g',
    caloriesPerPortion: 55, proteinPerPortion: 7, carbsPerPortion: 0, fatPerPortion: 3,
    category: 'meat', fatLevel: 'low'
  },
  {
    id: 'meat-low-3', name: '板豆腐', portionSize: 80, portionUnit: 'g',
    caloriesPerPortion: 55, proteinPerPortion: 7, carbsPerPortion: 0, fatPerPortion: 3,
    category: 'meat', fatLevel: 'low'
  },
  {
    id: 'meat-low-4', name: '無糖豆漿', portionSize: 190, portionUnit: 'ml',
    caloriesPerPortion: 55, proteinPerPortion: 7, carbsPerPortion: 0, fatPerPortion: 3,
    category: 'meat', fatLevel: 'low'
  },

  // ============= 豆魚蛋肉類 - 中脂 =============
  // 1份 = 55g (雞蛋)
  {
    id: 'meat-med-1', name: '雞蛋', portionSize: 55, portionUnit: 'g',
    caloriesPerPortion: 75, proteinPerPortion: 7, carbsPerPortion: 0, fatPerPortion: 5,
    category: 'meat', fatLevel: 'medium'
  },
  {
    id: 'meat-med-2', name: '鮭魚', portionSize: 35, portionUnit: 'g',
    caloriesPerPortion: 75, proteinPerPortion: 7, carbsPerPortion: 0, fatPerPortion: 5,
    category: 'meat', fatLevel: 'medium'
  },
  {
    id: 'meat-med-3', name: '豬里肌', portionSize: 35, portionUnit: 'g',
    caloriesPerPortion: 75, proteinPerPortion: 7, carbsPerPortion: 0, fatPerPortion: 5,
    category: 'meat', fatLevel: 'medium'
  },

  // ============= 豆魚蛋肉類 - 高脂 =============
  {
    id: 'meat-high-1', name: '五花肉', portionSize: 35, portionUnit: 'g',
    caloriesPerPortion: 120, proteinPerPortion: 7, carbsPerPortion: 0, fatPerPortion: 10,
    category: 'meat', fatLevel: 'high'
  },
  {
    id: 'meat-high-2', name: '秦孫香腸', portionSize: 40, portionUnit: 'g',
    caloriesPerPortion: 120, proteinPerPortion: 7, carbsPerPortion: 0, fatPerPortion: 10,
    category: 'meat', fatLevel: 'high'
  },

  // ============= 全穀雜糧類 =============
  // 1份 = 40g 白飯 (1/4碗)
  {
    id: 'staple-1', name: '白飯', portionSize: 40, portionUnit: 'g',
    caloriesPerPortion: 70, proteinPerPortion: 2, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'staple'
  },
  {
    id: 'staple-2', name: '糙米飯', portionSize: 40, portionUnit: 'g',
    caloriesPerPortion: 70, proteinPerPortion: 2, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'staple'
  },
  {
    id: 'staple-3', name: '地瓜', portionSize: 55, portionUnit: 'g',
    caloriesPerPortion: 70, proteinPerPortion: 2, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'staple'
  },
  {
    id: 'staple-4', name: '馬鈴薯', portionSize: 90, portionUnit: 'g',
    caloriesPerPortion: 70, proteinPerPortion: 2, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'staple'
  },
  {
    id: 'staple-5', name: '燕麥片', portionSize: 20, portionUnit: 'g',
    caloriesPerPortion: 70, proteinPerPortion: 2, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'staple'
  },
  {
    id: 'staple-6', name: '吐司(薄片)', portionSize: 25, portionUnit: 'g',
    caloriesPerPortion: 70, proteinPerPortion: 2, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'staple'
  },

  // ============= 蔬菜類 =============
  // 1份 = 100g 熟菜
  {
    id: 'veg-1', name: '燙青菜', portionSize: 100, portionUnit: 'g',
    caloriesPerPortion: 25, proteinPerPortion: 1, carbsPerPortion: 5, fatPerPortion: 0,
    category: 'vegetable'
  },
  {
    id: 'veg-2', name: '花椰菜', portionSize: 100, portionUnit: 'g',
    caloriesPerPortion: 25, proteinPerPortion: 1, carbsPerPortion: 5, fatPerPortion: 0,
    category: 'vegetable'
  },
  {
    id: 'veg-3', name: '高麗菜', portionSize: 100, portionUnit: 'g',
    caloriesPerPortion: 25, proteinPerPortion: 1, carbsPerPortion: 5, fatPerPortion: 0,
    category: 'vegetable'
  },
  {
    id: 'veg-4', name: '地瓜葉', portionSize: 100, portionUnit: 'g',
    caloriesPerPortion: 25, proteinPerPortion: 1, carbsPerPortion: 5, fatPerPortion: 0,
    category: 'vegetable'
  },

  // ============= 水果類 =============
  // 1份 ≈ 100g
  {
    id: 'fruit-1', name: '蘋果', portionSize: 115, portionUnit: 'g',
    caloriesPerPortion: 60, proteinPerPortion: 0, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'fruit'
  },
  {
    id: 'fruit-2', name: '芭樂', portionSize: 155, portionUnit: 'g',
    caloriesPerPortion: 60, proteinPerPortion: 0, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'fruit'
  },
  {
    id: 'fruit-3', name: '香蕉', portionSize: 70, portionUnit: 'g',
    caloriesPerPortion: 60, proteinPerPortion: 0, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'fruit'
  },
  {
    id: 'fruit-4', name: '奇異果', portionSize: 105, portionUnit: 'g',
    caloriesPerPortion: 60, proteinPerPortion: 0, carbsPerPortion: 15, fatPerPortion: 0,
    category: 'fruit'
  },

  // ============= 油脂與堅果種子類 =============
  // 1份 = 5g 油 or 10g 堅果
  {
    id: 'fat-1', name: '堅果(綜合)', portionSize: 10, portionUnit: 'g',
    caloriesPerPortion: 45, proteinPerPortion: 0, carbsPerPortion: 0, fatPerPortion: 5,
    category: 'fat'
  },
  {
    id: 'fat-2', name: '橄欖油', portionSize: 5, portionUnit: 'ml',
    caloriesPerPortion: 45, proteinPerPortion: 0, carbsPerPortion: 0, fatPerPortion: 5,
    category: 'fat'
  },
  {
    id: 'fat-3', name: '花生', portionSize: 13, portionUnit: 'g',
    caloriesPerPortion: 45, proteinPerPortion: 0, carbsPerPortion: 0, fatPerPortion: 5,
    category: 'fat'
  },
];

export const COOKING_MODIFIERS: Record<CookingMethod, { name: string, cal: number, fat: number }> = {
  original: { name: '原始/生鮮', cal: 0, fat: 0 },
  boiled: { name: '水煮/清蒸', cal: 0, fat: 0 },
  stir_fried: { name: '快炒', cal: 45, fat: 5 },
  pan_fried: { name: '煎/烤', cal: 30, fat: 3 },
  deep_fried: { name: '油炸', cal: 135, fat: 15 },
};

export const CATEGORY_LABELS: Record<string, string> = {
  staple: '全穀雜糧',
  meat: '豆魚蛋肉',
  vegetable: '蔬菜',
  fruit: '水果',
  dairy: '乳品',
  fat: '油脂與堅果',
  other: '其他'
};

export const CATEGORY_COLORS: Record<string, string> = {
  staple: '#f59e0b', // Amber
  meat: '#ef4444',   // Red
  vegetable: '#10b981', // Emerald
  fruit: '#f43f5e', // Rose
  dairy: '#3b82f6', // Blue
  fat: '#eab308',   // Yellow
  other: '#94a3b8'  // Slate
};

export const CATEGORY_ICONS: Record<string, string> = {
  staple: 'fa-bowl-rice',
  meat: 'fa-drumstick-bite',
  vegetable: 'fa-carrot',
  fruit: 'fa-apple-whole',
  dairy: 'fa-cow',
  fat: 'fa-bottle-droplet',
  other: 'fa-utensils'
};

export const MEAL_LABELS: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '點心'
};

// 重新導出 exchangeConstants 的內容供其他模組使用
export {
  DAIRY_EXCHANGE,
  MEAT_EXCHANGE,
  STAPLE_EXCHANGE,
  VEGETABLE_EXCHANGE,
  FRUIT_EXCHANGE,
  FAT_EXCHANGE,
  getExchangeValue
} from './constants/exchangeConstants';

// 保留舊版 EXCHANGE_STANDARDS 以保持向後兼容
export const EXCHANGE_STANDARDS: Record<FoodCategory, { cal: number, p: number, c: number, f: number }> = {
  staple: { cal: 70, p: 2, c: 15, f: 0 },
  meat: { cal: 75, p: 7, c: 0, f: 5 },      // 中脂平均值
  vegetable: { cal: 25, p: 1, c: 5, f: 0 },
  fruit: { cal: 60, p: 0, c: 15, f: 0 },
  dairy: { cal: 120, p: 8, c: 12, f: 4 },   // 低脂平均值
  fat: { cal: 45, p: 0, c: 0, f: 5 },
  other: { cal: 0, p: 0, c: 0, f: 0 }
};

export const MEAL_TEMPLATES: MealTemplate[] = [
  {
    id: 'default_1',
    name: "1500卡 減脂全日餐",
    note: "【營養師叮嚀】\n1. 早餐的地瓜是優質澱粉，連皮吃纖維更多喔！\n2. 晚餐澱粉量減半，若會餓可以多吃一份蔬菜。\n3. 水分攝取目標：2000cc / 日。",
    macroRatio: { protein: 25, carbs: 45, fat: 30 },
    targetPortions: { staple: 3, meat: 5, vegetable: 3, fruit: 1, dairy: 1, fat: 0, other: 0 },
    detailedPortions: { meatLow: 3, meatMedium: 2, meatHigh: 0, dairyFull: 0, dairyLow: 1, dairySkim: 0 },
    items: [
      { meal: 'breakfast', foodId: 'staple-3', amount: 1.5, method: 'boiled', portionDesc: '1.5 份全穀', customName: '蒸地瓜' },
      { meal: 'breakfast', foodId: 'meat-med-1', amount: 1, method: 'boiled', portionDesc: '1 份肉類', customName: '水煮蛋' },
      { meal: 'breakfast', foodId: 'dairy-low-1', amount: 1, method: 'original', portionDesc: '1 份乳品', customName: '低脂鮮乳' },
      { meal: 'lunch', foodId: 'staple-1', amount: 1, method: 'boiled', portionDesc: '1 份全穀', customName: '白飯' },
      { meal: 'lunch', foodId: 'meat-low-1', amount: 2, method: 'pan_fried', portionDesc: '2 份肉類', customName: '乾煎雞胸' },
      { meal: 'lunch', foodId: 'veg-1', amount: 1.5, method: 'stir_fried', portionDesc: '1.5 份蔬菜', customName: '炒青菜' },
      { meal: 'dinner', foodId: 'staple-1', amount: 0.5, method: 'boiled', portionDesc: '0.5 份全穀', customName: '半碗飯' },
      { meal: 'dinner', foodId: 'meat-med-2', amount: 1.5, method: 'boiled', portionDesc: '1.5 份肉類', customName: '清蒸魚片' },
      { meal: 'dinner', foodId: 'veg-1', amount: 1.5, method: 'boiled', portionDesc: '1.5 份蔬菜', customName: '燙青菜' },
      { meal: 'dinner', foodId: 'fruit-1', amount: 1, method: 'original', portionDesc: '1 份水果', customName: '蘋果' }
    ]
  },
  {
    id: 'default_2',
    name: "1800卡 增肌全日餐",
    note: "【營養師叮嚀】\n1. 訓練後的一餐特別重要，請確保蛋白質充足。\n2. 堅果含有優質油脂，但也別吃過量，一天一湯匙即可。\n3. 若訓練量大，可在餐間補充香蕉或豆漿。",
    macroRatio: { protein: 30, carbs: 40, fat: 30 },
    targetPortions: { staple: 5.5, meat: 8, vegetable: 4, fruit: 0, dairy: 1, fat: 1, other: 0 },
    detailedPortions: { meatLow: 5, meatMedium: 3, meatHigh: 0, dairyFull: 1, dairyLow: 0, dairySkim: 0 },
    items: [
      { meal: 'breakfast', foodId: 'staple-5', amount: 2, method: 'boiled', portionDesc: '2 份全穀', customName: '燕麥粥' },
      { meal: 'breakfast', foodId: 'meat-med-1', amount: 2, method: 'boiled', portionDesc: '2 份肉類', customName: '水煮蛋兩顆' },
      { meal: 'breakfast', foodId: 'dairy-full-1', amount: 1, method: 'original', portionDesc: '1 份乳品', customName: '全脂鮮乳' },
      { meal: 'lunch', foodId: 'staple-1', amount: 1.5, method: 'boiled', portionDesc: '1.5 份全穀', customName: '白飯' },
      { meal: 'lunch', foodId: 'meat-low-1', amount: 3, method: 'pan_fried', portionDesc: '3 份肉類', customName: '香料雞胸' },
      { meal: 'lunch', foodId: 'veg-1', amount: 2, method: 'stir_fried', portionDesc: '2 份蔬菜', customName: '炒時蔬' },
      { meal: 'lunch', foodId: 'fat-1', amount: 1, method: 'original', portionDesc: '1 份油脂', customName: '堅果' },
      { meal: 'dinner', foodId: 'staple-3', amount: 2, method: 'boiled', portionDesc: '2 份全穀', customName: '烤地瓜' },
      { meal: 'dinner', foodId: 'meat-med-2', amount: 3, method: 'pan_fried', portionDesc: '3 份肉類', customName: '煎鮭魚排' },
      { meal: 'dinner', foodId: 'veg-1', amount: 2, method: 'boiled', portionDesc: '2 份蔬菜', customName: '溫沙拉' }
    ]
  },
  {
    id: 'default_3',
    name: "糖尿病 控糖全日餐",
    note: "【營養師叮嚀】\n1. 進食順序建議：蔬菜 -> 蛋白質 -> 澱粉。\n2. 水果建議在兩餐之間食用，避免飯後血糖波動過大。\n3. 澱粉類多選擇未精緻全穀雜糧。",
    macroRatio: { protein: 20, carbs: 45, fat: 35 },
    targetPortions: { staple: 3.3, meat: 5, vegetable: 4, fruit: 1, dairy: 0, fat: 0, other: 0 },
    detailedPortions: { meatLow: 5, meatMedium: 0, meatHigh: 0, dairyFull: 0, dairyLow: 0, dairySkim: 0 },
    items: [
      { meal: 'breakfast', foodId: 'staple-5', amount: 1.5, method: 'boiled', portionDesc: '1.5 份全穀', customName: '燕麥片' },
      { meal: 'breakfast', foodId: 'meat-low-4', amount: 1, method: 'original', portionDesc: '1 份肉類', customName: '無糖豆漿' },
      { meal: 'lunch', foodId: 'staple-3', amount: 1, method: 'boiled', portionDesc: '1 份全穀', customName: '蒸地瓜 (帶皮)' },
      { meal: 'lunch', foodId: 'meat-low-1', amount: 2, method: 'boiled', portionDesc: '2 份肉類', customName: '蔥油雞' },
      { meal: 'lunch', foodId: 'veg-1', amount: 2, method: 'stir_fried', portionDesc: '2 份蔬菜', customName: '炒深色蔬菜' },
      { meal: 'dinner', foodId: 'staple-2', amount: 0.8, method: 'boiled', portionDesc: '0.8 份全穀', customName: '五穀飯' },
      { meal: 'dinner', foodId: 'meat-low-2', amount: 2, method: 'boiled', portionDesc: '2 份肉類', customName: '清蒸鱸魚' },
      { meal: 'dinner', foodId: 'veg-4', amount: 2, method: 'boiled', portionDesc: '2 份蔬菜', customName: '燙地瓜葉' },
      { meal: 'dinner', foodId: 'fruit-2', amount: 1, method: 'original', portionDesc: '1 份水果', customName: '芭樂' }
    ]
  }
];

export const PRESET_MENUS: DailyItems[] = [];
