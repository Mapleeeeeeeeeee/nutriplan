
export type FoodCategory = 'staple' | 'meat' | 'vegetable' | 'fruit' | 'dairy' | 'fat' | 'other';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
  category: FoodCategory;
}

export type CookingMethod = 'original' | 'boiled' | 'stir_fried' | 'pan_fried' | 'deep_fried';

export interface MenuEntry {
  id: string;
  foodId: string;
  amount: number;
  cookingMethod: CookingMethod;
  customName?: string; // For Dish names like "Kung Pao Chicken"
  portionDescription?: string; // For "Exchange" description like "2份肉"
  portionValue?: number; // Numeric value for stats tracking
}

// ABC 選擇器 - 單個選項
export interface MealChoiceOption {
  id: string;
  label: string;        // 例如：「想吃飯」「想省錢」「想吃麵包」
  entries: MenuEntry[]; // 該選項包含的食物
}

// ABC 選擇器 - 完整選擇區塊
export interface MealChoice {
  enabled: boolean;              // 是否啟用選擇模式
  options: MealChoiceOption[];   // ABC 選項列表
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// 單餐資料結構（支援單一模式與選擇模式）
export interface MealData {
  entries: MenuEntry[];     // 單一模式的食物列表
  choice?: MealChoice;      // 選擇模式的資料（可選）
}

export type DailyItems = Record<MealType, MealData>;

// 舊版 DailyItems 結構（用於向後兼容轉換）
export type LegacyDailyItems = Record<MealType, MenuEntry[]>;

export type PlanType = 'single' | 'cycle';

export interface MenuPlan {
  id: string;
  name: string;
  type: PlanType;
  cycleDays: number;
  targetCalories: number;
  // Percentage values, e.g., { protein: 20, carbs: 50, fat: 30 }
  macroRatio: {
    protein: number;
    carbs: number;
    fat: number;
  };
  targetPortions: Record<FoodCategory, number>;
  // Index 0 = Day 1, Index 1 = Day 2...
  days: DailyItems[];
  notes: string[]; // Chef's notes per day
  createdAt: number;
}

export interface MealTemplateItem {
  meal: string;
  foodId: string;
  amount: number;
  method: string;
  portionDesc: string;
  customName?: string;
}

export interface MealTemplate {
  id: string;
  name: string;
  note: string;
  macroRatio: {
    protein: number;
    carbs: number;
    fat: number;
  };
  items: MealTemplateItem[];
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type View = 'dashboard' | 'database' | 'builder' | 'templates';

// 工具函數：將舊版 DailyItems 轉換為新版
export const migrateLegacyDailyItems = (legacy: LegacyDailyItems): DailyItems => {
  const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const result = {} as DailyItems;

  meals.forEach(meal => {
    const entries = legacy[meal];
    if (Array.isArray(entries)) {
      result[meal] = { entries };
    } else {
      result[meal] = entries; // 已經是新格式
    }
  });

  return result;
};

// 工具函數：檢查是否為舊版格式
export const isLegacyFormat = (day: any): day is LegacyDailyItems => {
  return Array.isArray(day?.breakfast) || Array.isArray(day?.lunch) ||
    Array.isArray(day?.dinner) || Array.isArray(day?.snack);
};
