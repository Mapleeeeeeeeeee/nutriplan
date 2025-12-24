import { useMemo } from 'react';
import { MenuPlan, FoodItem, MealType, FoodCategory } from '../types';
import { COOKING_MODIFIERS } from '../constants';

export const useMenuStats = (currentPlan: MenuPlan, foods: FoodItem[]) => {
    const getFood = (id: string) => foods.find(f => f.id === id);

    const stats = useMemo(() => {
        const dayStats = currentPlan.days.map(day => {
            let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            let portions: Record<FoodCategory, number> = {
                staple: 0, meat: 0, vegetable: 0, fruit: 0, dairy: 0, fat: 0, other: 0
            };

            (Object.keys(day) as MealType[]).forEach(meal => {
                const mealData = day[meal];
                // 計算單一模式的 entries
                mealData.entries.forEach(entry => {
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

                // 如果有選擇模式，也計算第一個選項（用於預估熱量）
                if (mealData.choice?.enabled && mealData.choice.options.length > 0) {
                    mealData.choice.options[0].entries.forEach(entry => {
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
                }
            });
            return { totals, portions };
        });
        return { dayStats };
    }, [currentPlan, foods]);

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
