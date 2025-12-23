
import { FoodItem, DailyItems, CookingMethod, MealTemplate, FoodCategory } from './types';

export const INITIAL_FOODS: FoodItem[] = [
  // 澱粉
  { id: '1', name: '白飯', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: '100g', category: 'staple' },
  { id: '11', name: '糙米飯', calories: 112, protein: 2.6, carbs: 23, fat: 1, unit: '100g', category: 'staple' },
  { id: '10', name: '地瓜', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: '100g', category: 'staple' },
  { id: '12', name: '馬鈴薯', calories: 77, protein: 2, carbs: 17, fat: 0.1, unit: '100g', category: 'staple' },
  { id: '6', name: '燕麥片', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, unit: '100g', category: 'staple' },
  { id: '13', name: '吐司', calories: 145, protein: 4.5, carbs: 27, fat: 2, unit: '1片', category: 'staple' },

  // 蛋白質 (豆魚蛋肉) & 乳品
  { id: '2', name: '雞胸肉', calories: 104, protein: 22, carbs: 0, fat: 0.9, unit: '100g', category: 'meat' },
  { id: '9', name: '鮭魚', calories: 160, protein: 20, carbs: 0, fat: 8, unit: '100g', category: 'meat' },
  { id: '4', name: '雞蛋', calories: 75, protein: 7, carbs: 0.5, fat: 5, unit: '1顆', category: 'meat' },
  { id: '14', name: '板豆腐', calories: 85, protein: 8.5, carbs: 1.5, fat: 3.5, unit: '100g', category: 'meat' },
  { id: '15', name: '無糖豆漿', calories: 35, protein: 3.6, carbs: 0.7, fat: 1.9, unit: '100ml', category: 'meat' },
  { id: '17', name: '豬里肌', calories: 180, protein: 22, carbs: 0, fat: 10, unit: '100g', category: 'meat' },
  { id: '16', name: '無糖優格', calories: 60, protein: 3.5, carbs: 4.5, fat: 3.2, unit: '100g', category: 'dairy' },
  { id: '7', name: '鮮乳', calories: 60, protein: 3, carbs: 5, fat: 3.5, unit: '100ml', category: 'dairy' },

  // 蔬菜
  { id: '3', name: '燙青菜', calories: 25, protein: 1.5, carbs: 4, fat: 0.2, unit: '100g', category: 'vegetable' },
  { id: '18', name: '花椰菜', calories: 25, protein: 2, carbs: 5, fat: 0, unit: '100g', category: 'vegetable' },
  { id: '19', name: '高麗菜', calories: 25, protein: 1.3, carbs: 5.8, fat: 0.2, unit: '100g', category: 'vegetable' },

  // 水果
  { id: '5', name: '蘋果', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: '100g', category: 'fruit' },
  { id: '20', name: '芭樂', calories: 38, protein: 0.8, carbs: 9, fat: 0.1, unit: '100g', category: 'fruit' },
  { id: '21', name: '香蕉', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: '100g', category: 'fruit' },

  // 油脂
  { id: '8', name: '堅果', calories: 65, protein: 2, carbs: 2, fat: 6, unit: '10g', category: 'fat' },
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

// Standard Exchange Values (Approximate averages for estimation)
export const EXCHANGE_STANDARDS: Record<FoodCategory, { cal: number, p: number, c: number, f: number }> = {
  staple: { cal: 70, p: 2, c: 15, f: 0 },
  meat: { cal: 75, p: 7, c: 0, f: 5 },      // Medium fat meat average
  vegetable: { cal: 25, p: 1, c: 5, f: 0 },
  fruit: { cal: 60, p: 0, c: 15, f: 0 },
  dairy: { cal: 120, p: 8, c: 12, f: 4 },   // Low fat milk average
  fat: { cal: 45, p: 0, c: 0, f: 5 },
  other: { cal: 0, p: 0, c: 0, f: 0 }
};

export const MEAL_TEMPLATES: MealTemplate[] = [
  {
    id: 'default_1',
    name: "1500卡 減脂全日餐",
    note: "【營養師叮嚀】\n1. 早餐的地瓜是優質澱粉，連皮吃纖維更多喔！\n2. 晚餐澱粉量減半，若會餓可以多吃一份蔬菜。\n3. 水分攝取目標：2000cc / 日。",
    macroRatio: { protein: 25, carbs: 45, fat: 30 },
    items: [
      // 早餐: 地瓜+蛋+牛奶
      { meal: 'breakfast', foodId: '10', amount: 1.5, method: 'boiled', portionDesc: '1.5 份全穀', customName: '蒸地瓜' },
      { meal: 'breakfast', foodId: '4', amount: 1, method: 'boiled', portionDesc: '1 份肉類', customName: '水煮蛋' },
      { meal: 'breakfast', foodId: '7', amount: 2.4, method: 'original', portionDesc: '1 份乳品', customName: '低脂鮮乳' },
      // 午餐: 飯+雞胸+菜
      { meal: 'lunch', foodId: '1', amount: 1, method: 'boiled', portionDesc: '1 份全穀', customName: '白飯' },
      { meal: 'lunch', foodId: '2', amount: 2, method: 'pan_fried', portionDesc: '2 份肉類', customName: '乾煎雞胸' },
      { meal: 'lunch', foodId: '3', amount: 1.5, method: 'stir_fried', portionDesc: '1.5 份蔬菜', customName: '炒青菜' },
      // 晚餐: 飯+魚+菜+果
      { meal: 'dinner', foodId: '1', amount: 0.5, method: 'boiled', portionDesc: '0.5 份全穀', customName: '半碗飯' },
      { meal: 'dinner', foodId: '9', amount: 1.5, method: 'boiled', portionDesc: '1.5 份肉類', customName: '清蒸魚片' },
      { meal: 'dinner', foodId: '3', amount: 1.5, method: 'boiled', portionDesc: '1.5 份蔬菜', customName: '燙青菜' },
      { meal: 'dinner', foodId: '5', amount: 1, method: 'original', portionDesc: '1 份水果', customName: '蘋果' }
    ]
  },
  {
    id: 'default_2',
    name: "1800卡 增肌全日餐",
    note: "【營養師叮嚀】\n1. 訓練後的一餐特別重要，請確保蛋白質充足。\n2. 堅果含有優質油脂，但也別吃過量，一天一湯匙即可。\n3. 若訓練量大，可在餐間補充香蕉或豆漿。",
    macroRatio: { protein: 30, carbs: 40, fat: 30 }, // 增肌：高蛋白
    items: [
      // 早餐
      { meal: 'breakfast', foodId: '6', amount: 2, method: 'boiled', portionDesc: '2 份全穀', customName: '燕麥粥' },
      { meal: 'breakfast', foodId: '4', amount: 2, method: 'boiled', portionDesc: '2 份肉類', customName: '水煮蛋兩顆' },
      { meal: 'breakfast', foodId: '7', amount: 2.4, method: 'original', portionDesc: '1 份乳品', customName: '全脂鮮乳' },
      // 午餐
      { meal: 'lunch', foodId: '1', amount: 1.5, method: 'boiled', portionDesc: '1.5 份全穀', customName: '白飯' },
      { meal: 'lunch', foodId: '2', amount: 3, method: 'pan_fried', portionDesc: '3 份肉類', customName: '香料雞胸' },
      { meal: 'lunch', foodId: '3', amount: 2, method: 'stir_fried', portionDesc: '2 份蔬菜', customName: '炒時蔬' },
      { meal: 'lunch', foodId: '8', amount: 1, method: 'original', portionDesc: '1 份油脂', customName: '堅果' },
      // 晚餐
      { meal: 'dinner', foodId: '10', amount: 2, method: 'boiled', portionDesc: '2 份全穀', customName: '烤地瓜' },
      { meal: 'dinner', foodId: '9', amount: 3, method: 'pan_fried', portionDesc: '3 份肉類', customName: '煎鮭魚排' },
      { meal: 'dinner', foodId: '3', amount: 2, method: 'boiled', portionDesc: '2 份蔬菜', customName: '溫沙拉' }
    ]
  },
  {
    id: 'default_3',
    name: "糖尿病 控糖全日餐",
    note: "【營養師叮嚀】\n1. 進食順序建議：蔬菜 -> 蛋白質 -> 澱粉。\n2. 水果建議在兩餐之間食用，避免飯後血糖波動過大。\n3. 澱粉類多選擇未精緻全穀雜糧。",
    macroRatio: { protein: 20, carbs: 45, fat: 35 }, // 控糖：較低碳水
    items: [
      // 早餐
      { meal: 'breakfast', foodId: '6', amount: 1.5, method: 'boiled', portionDesc: '1.5 份全穀', customName: '燕麥片' },
      { meal: 'breakfast', foodId: '7', amount: 2.4, method: 'original', portionDesc: '1 份乳品', customName: '無糖豆漿(替)' },
      // 午餐
      { meal: 'lunch', foodId: '10', amount: 1, method: 'boiled', portionDesc: '1 份全穀', customName: '蒸地瓜 (帶皮)' },
      { meal: 'lunch', foodId: '2', amount: 2, method: 'boiled', portionDesc: '2 份肉類', customName: '蔥油雞' },
      { meal: 'lunch', foodId: '3', amount: 2, method: 'stir_fried', portionDesc: '2 份蔬菜', customName: '炒深色蔬菜' },
      // 晚餐
      { meal: 'dinner', foodId: '1', amount: 0.8, method: 'boiled', portionDesc: '0.8 份全穀', customName: '五穀飯' },
      { meal: 'dinner', foodId: '9', amount: 2, method: 'boiled', portionDesc: '2 份肉類', customName: '清蒸鱸魚' },
      { meal: 'dinner', foodId: '3', amount: 2, method: 'boiled', portionDesc: '2 份蔬菜', customName: '燙地瓜葉' },
      { meal: 'dinner', foodId: '5', amount: 1, method: 'original', portionDesc: '1 份水果', customName: '芭樂' }
    ]
  }
];

export const PRESET_MENUS: DailyItems[] = [];
