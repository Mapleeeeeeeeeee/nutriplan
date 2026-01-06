import React, { useCallback } from 'react';
import { MenuPlan, MealType, MenuEntry, CookingMethod, FoodItem, MealData } from '../types';
import { CATEGORY_LABELS } from '../constants';

// ============= 類型定義 =============

export interface UseEntryActionsReturn {
    addEntry: (meal: MealType, foodId: string, method: CookingMethod, portionDesc: string) => void;
    removeEntry: (meal: MealType, entryId: string) => void;
    updateEntryField: (meal: MealType, entryId: string, field: keyof MenuEntry, value: string) => void;
}

interface UseEntryActionsParams {
    currentPlan: MenuPlan;
    setCurrentPlan: React.Dispatch<React.SetStateAction<MenuPlan>>;
    activeDayIndex: number;
    getFood: (id: string) => FoodItem | undefined;
    activeChoiceOption: { meal: MealType; optionId: string } | null;
}

// ============= 輔助函數 =============

const generateId = (): string => Math.random().toString(36).substr(2, 9);

// ============= Hook 定義 =============

/**
 * 單一模式 Entry 操作 Hook
 * 負責新增、刪除、更新食物項目
 */
export const useEntryActions = ({
    currentPlan,
    setCurrentPlan,
    activeDayIndex,
    getFood,
    activeChoiceOption
}: UseEntryActionsParams): UseEntryActionsReturn => {

    const addEntry = useCallback((
        meal: MealType,
        foodId: string,
        method: CookingMethod,
        portionDesc: string
    ) => {
        const food = getFood(foodId);
        const amount = 1;
        const newEntry: MenuEntry = {
            id: generateId(),
            foodId: foodId,
            amount: amount,
            cookingMethod: method,
            portionDescription: portionDesc.includes('份')
                ? portionDesc
                : `${portionDesc} 份${food ? CATEGORY_LABELS[food.category] : ''}`,
            portionValue: parseFloat(portionDesc) || amount
        };

        setCurrentPlan(prev => {
            const newDays = [...prev.days];
            const mealData = newDays[activeDayIndex][meal];

            // 檢查是否為選擇模式且有選中的選項
            if (mealData.choice?.enabled && activeChoiceOption?.meal === meal && activeChoiceOption.optionId) {
                // 添加到選中的選項
                const updatedChoice = {
                    ...mealData.choice,
                    options: mealData.choice.options.map(opt =>
                        opt.id === activeChoiceOption.optionId
                            ? { ...opt, entries: [...opt.entries, newEntry] }
                            : opt
                    )
                };
                newDays[activeDayIndex] = {
                    ...newDays[activeDayIndex],
                    [meal]: { ...mealData, choice: updatedChoice }
                };
            } else {
                // 單一模式：添加到 entries
                newDays[activeDayIndex] = {
                    ...newDays[activeDayIndex],
                    [meal]: { ...mealData, entries: [...mealData.entries, newEntry] }
                };
            }

            return { ...prev, days: newDays };
        });
    }, [activeDayIndex, getFood, activeChoiceOption, setCurrentPlan]);

    const removeEntry = useCallback((meal: MealType, entryId: string) => {
        setCurrentPlan(prev => {
            const newDays = [...prev.days];
            const mealData = newDays[activeDayIndex][meal];
            newDays[activeDayIndex] = {
                ...newDays[activeDayIndex],
                [meal]: { ...mealData, entries: mealData.entries.filter(e => e.id !== entryId) }
            };
            return { ...prev, days: newDays };
        });
    }, [activeDayIndex, setCurrentPlan]);

    const updateEntryField = useCallback((
        meal: MealType,
        entryId: string,
        field: keyof MenuEntry,
        value: string
    ) => {
        setCurrentPlan(prev => {
            const newDays = [...prev.days];
            const mealData = newDays[activeDayIndex][meal];

            const updatedEntries = mealData.entries.map(e => {
                if (e.id === entryId) {
                    const updatedEntry = { ...e, [field]: value };
                    if (field === 'portionDescription') {
                        const parsed = parseFloat(value);
                        if (!isNaN(parsed)) {
                            updatedEntry.portionValue = parsed;
                            updatedEntry.amount = parsed; // 同步更新 amount 以觸發熱量重新計算
                        }
                    }
                    return updatedEntry;
                }
                return e;
            });

            newDays[activeDayIndex] = {
                ...newDays[activeDayIndex],
                [meal]: { ...mealData, entries: updatedEntries }
            };
            return { ...prev, days: newDays };
        });
    }, [activeDayIndex, setCurrentPlan]);

    return { addEntry, removeEntry, updateEntryField };
};
