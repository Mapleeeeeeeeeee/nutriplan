import { useMemo } from 'react';
import { MenuPlan, FoodItem, MealType, FoodCategory, MenuEntry } from '../types';
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

    entries.forEach(entry => {
        const food = getFood(entry.foodId);
        if (food) {
            const mod = COOKING_MODIFIERS[entry.cookingMethod];
            totals.calories += (food.calories + mod.cal) * entry.amount;
            totals.protein += food.protein * entry.amount;
            totals.carbs += food.carbs * entry.amount;
            totals.fat += (food.fat + mod.fat) * entry.amount;
            portions[food.category] += (entry.portionValue || entry.amount);
        }
    });

    return { totals, portions };
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

            (Object.keys(day) as MealType[]).forEach(meal => {
                const mealData = day[meal];

                // 判斷此餐是否為選擇模式
                const isChoiceMode = mealData.choice?.enabled && mealData.choice.options.length > 0;

                if (isChoiceMode && mealData.choice) {
                    // 選擇模式：根據當前選中的選項計算
                    let selectedOption = mealData.choice.options[0]; // 預設第一個

                    // 如果有選中的選項且屬於這個餐
                    if (activeChoiceOption && activeChoiceOption.meal === meal) {
                        const found = mealData.choice.options.find(
                            opt => opt.id === activeChoiceOption.optionId
                        );
                        if (found) {
                            selectedOption = found;
                        }
                    }

                    // 計算選中選項的數據
                    const optionStats = calculateEntryStats(selectedOption.entries, getFood);
                    totals.calories += optionStats.totals.calories;
                    totals.protein += optionStats.totals.protein;
                    totals.carbs += optionStats.totals.carbs;
                    totals.fat += optionStats.totals.fat;
                    Object.keys(optionStats.portions).forEach(key => {
                        portions[key as FoodCategory] += optionStats.portions[key as FoodCategory];
                    });
                } else {
                    // 單一模式：計算 entries
                    const entryStats = calculateEntryStats(mealData.entries, getFood);
                    totals.calories += entryStats.totals.calories;
                    totals.protein += entryStats.totals.protein;
                    totals.carbs += entryStats.totals.carbs;
                    totals.fat += entryStats.totals.fat;
                    Object.keys(entryStats.portions).forEach(key => {
                        portions[key as FoodCategory] += entryStats.portions[key as FoodCategory];
                    });
                }
            });
            return { totals, portions };
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
