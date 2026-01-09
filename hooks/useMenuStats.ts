import { useMemo } from 'react';
import { MenuPlan, FoodItem, MealType, FoodCategory, MenuEntry, DetailedPortions } from '../types';
import { COOKING_MODIFIERS } from '../constants';

interface ActiveChoiceOption {
    meal: MealType;
    optionId: string;
}

// 計算 entries 的營養數據
const calculateEntryStats = (
    entries: MenuEntry[],
    getFood: (id: string) => FoodItem | undefined
) => {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    let portions: Record<FoodCategory, number> = {
        staple: 0, meat: 0, vegetable: 0, fruit: 0, dairy: 0, fat: 0, other: 0
    };
    // 細分的肉類/乳品份數
    let detailedPortions: DetailedPortions = {
        meatLow: 0, meatMedium: 0, meatHigh: 0,
        dairyFull: 0, dairyLow: 0, dairySkim: 0
    };

    entries.forEach(entry => {
        // 處理自訂餐點
        if (entry.isCustom && entry.customNutrition) {
            const amount = entry.amount || 1;
            totals.calories += entry.customNutrition.calories * amount;
            totals.protein += entry.customNutrition.protein * amount;
            totals.carbs += entry.customNutrition.carbs * amount;
            totals.fat += entry.customNutrition.fat * amount;
            // 自訂餐點歸類為 other
            portions.other += (entry.portionValue || entry.amount);
            return;
        }

        // 處理資料庫餐點
        const food = getFood(entry.foodId);
        if (food) {
            const mod = COOKING_MODIFIERS[entry.cookingMethod];
            totals.calories += (food.caloriesPerPortion + mod.cal) * entry.amount;
            totals.protein += food.proteinPerPortion * entry.amount;
            totals.carbs += food.carbsPerPortion * entry.amount;
            totals.fat += (food.fatPerPortion + mod.fat) * entry.amount;
            portions[food.category] += (entry.portionValue || entry.amount);

            // 追蹤細分的肉類/乳品份數
            if (food.category === 'meat' && food.fatLevel) {
                if (food.fatLevel === 'low') detailedPortions.meatLow += entry.amount;
                else if (food.fatLevel === 'medium') detailedPortions.meatMedium += entry.amount;
                else if (food.fatLevel === 'high') detailedPortions.meatHigh += entry.amount;
            }
            if (food.category === 'dairy' && food.fatLevel) {
                if (food.fatLevel === 'full') detailedPortions.dairyFull += entry.amount;
                else if (food.fatLevel === 'low') detailedPortions.dairyLow += entry.amount;
                else if (food.fatLevel === 'skim') detailedPortions.dairySkim += entry.amount;
            }
        }
    });

    return { totals, portions, detailedPortions };
};

export const useMenuStats = (
    currentPlan: MenuPlan,
    foods: FoodItem[],
    activeChoiceOption: ActiveChoiceOption | null = null
) => {
    const getFood = (id: string) => foods.find(f => f.id === id);

    const stats = useMemo(() => {
        const dayStats = currentPlan.days.map((day, dayIndex) => {
            let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            let portions: Record<FoodCategory, number> = {
                staple: 0, meat: 0, vegetable: 0, fruit: 0, dairy: 0, fat: 0, other: 0
            };
            let detailedPortions: DetailedPortions = {
                meatLow: 0, meatMedium: 0, meatHigh: 0,
                dairyFull: 0, dairyLow: 0, dairySkim: 0
            };

            (Object.keys(day) as MealType[]).forEach(meal => {
                const mealData = day[meal];
                const isChoiceMode = mealData.choice?.enabled && mealData.choice.options.length > 0;

                if (isChoiceMode && mealData.choice) {
                    let selectedOption = mealData.choice.options[0];

                    if (activeChoiceOption && activeChoiceOption.meal === meal) {
                        const found = mealData.choice.options.find(
                            opt => opt.id === activeChoiceOption.optionId
                        );
                        if (found) selectedOption = found;
                    }

                    const optionStats = calculateEntryStats(selectedOption.entries, getFood);
                    totals.calories += optionStats.totals.calories;
                    totals.protein += optionStats.totals.protein;
                    totals.carbs += optionStats.totals.carbs;
                    totals.fat += optionStats.totals.fat;
                    Object.keys(optionStats.portions).forEach(key => {
                        portions[key as FoodCategory] += optionStats.portions[key as FoodCategory];
                    });
                    // 累加細分份數
                    Object.keys(optionStats.detailedPortions).forEach(key => {
                        detailedPortions[key as keyof DetailedPortions] += optionStats.detailedPortions[key as keyof DetailedPortions];
                    });
                } else {
                    const entryStats = calculateEntryStats(mealData.entries, getFood);
                    totals.calories += entryStats.totals.calories;
                    totals.protein += entryStats.totals.protein;
                    totals.carbs += entryStats.totals.carbs;
                    totals.fat += entryStats.totals.fat;
                    Object.keys(entryStats.portions).forEach(key => {
                        portions[key as FoodCategory] += entryStats.portions[key as FoodCategory];
                    });
                    // 累加細分份數
                    Object.keys(entryStats.detailedPortions).forEach(key => {
                        detailedPortions[key as keyof DetailedPortions] += entryStats.detailedPortions[key as keyof DetailedPortions];
                    });
                }
            });
            return { totals, portions, detailedPortions };
        });
        return { dayStats };
    }, [currentPlan, foods, activeChoiceOption]);

    const targetGrams = useMemo(() => {
        const cal = currentPlan.targetCalories;
        return {
            protein: (cal * (currentPlan.macroRatio.protein / 100)) / 4,
            carbs: (cal * (currentPlan.macroRatio.carbs / 100)) / 4,
            fat: (cal * (currentPlan.macroRatio.fat / 100)) / 9,
        };
    }, [currentPlan.targetCalories, currentPlan.macroRatio]);

    return { stats, targetGrams };
};

