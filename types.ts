
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

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DailyItems = Record<MealType, MenuEntry[]>;

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
