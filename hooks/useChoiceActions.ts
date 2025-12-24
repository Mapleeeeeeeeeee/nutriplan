import React, { useState, useCallback } from 'react';
import { MenuPlan, MealType, MenuEntry, MealChoiceOption } from '../types';

// ============= 類型定義 =============

export interface ActiveChoiceOption {
    meal: MealType;
    optionId: string;
}

export interface UseChoiceActionsReturn {
    activeChoiceOption: ActiveChoiceOption | null;
    setActiveChoiceOption: React.Dispatch<React.SetStateAction<ActiveChoiceOption | null>>;
    toggleChoiceMode: (meal: MealType) => void;
    addChoiceOption: (meal: MealType) => void;
    updateChoiceOption: (meal: MealType, optionId: string, updates: Partial<MealChoiceOption>) => void;
    removeChoiceOption: (meal: MealType, optionId: string) => void;
    removeChoiceEntry: (meal: MealType, optionId: string, entryId: string) => void;
    updateChoiceEntryField: (
        meal: MealType,
        optionId: string,
        entryId: string,
        field: keyof MenuEntry,
        value: string
    ) => void;
    selectChoiceOption: (meal: MealType, optionId: string) => void;
}

interface UseChoiceActionsParams {
    currentPlan: MenuPlan;
    setCurrentPlan: React.Dispatch<React.SetStateAction<MenuPlan>>;
    activeDayIndex: number;
}

// ============= 常數定義 =============

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

// ============= 輔助函數 =============

const generateId = (): string => Math.random().toString(36).substr(2, 9);

// ============= Hook 定義 =============

/**
 * ABC 選擇模式操作 Hook
 * 負責選擇模式的切換、選項的增刪改
 */
export const useChoiceActions = ({
    currentPlan,
    setCurrentPlan,
    activeDayIndex
}: UseChoiceActionsParams): UseChoiceActionsReturn => {

    const [activeChoiceOption, setActiveChoiceOption] = useState<ActiveChoiceOption | null>(null);

    const toggleChoiceMode = useCallback((meal: MealType) => {
        setCurrentPlan(prev => {
            const newDays = [...prev.days];
            const mealData = newDays[activeDayIndex][meal];
            const currentChoice = mealData.choice || { enabled: false, options: [] };

            // 切換模式
            const newEnabled = !currentChoice.enabled;
            let newOptions = currentChoice.options;

            // 如果啟用選擇模式且沒有選項，自動創建一個
            if (newEnabled && newOptions.length === 0) {
                newOptions = [{
                    id: generateId(),
                    label: '選項 A',
                    entries: []
                }];
            }

            newDays[activeDayIndex] = {
                ...newDays[activeDayIndex],
                [meal]: {
                    ...mealData,
                    choice: { enabled: newEnabled, options: newOptions }
                }
            };

            // 如果啟用選擇模式，自動選中第一個選項
            if (newEnabled && newOptions.length > 0) {
                setActiveChoiceOption({ meal, optionId: newOptions[0].id });
            } else {
                setActiveChoiceOption(null);
            }

            return { ...prev, days: newDays };
        });
    }, [activeDayIndex, setCurrentPlan]);

    const addChoiceOption = useCallback((meal: MealType) => {
        setCurrentPlan(prev => {
            const newDays = [...prev.days];
            const mealData = newDays[activeDayIndex][meal];
            const currentChoice = mealData.choice || { enabled: true, options: [] };

            const optionCount = currentChoice.options.length;
            const newOption: MealChoiceOption = {
                id: generateId(),
                label: `選項 ${OPTION_LETTERS[optionCount] || optionCount + 1}`,
                entries: []
            };

            newDays[activeDayIndex] = {
                ...newDays[activeDayIndex],
                [meal]: {
                    ...mealData,
                    choice: {
                        ...currentChoice,
                        options: [...currentChoice.options, newOption]
                    }
                }
            };

            // 自動選中新增的選項
            setActiveChoiceOption({ meal, optionId: newOption.id });

            return { ...prev, days: newDays };
        });
    }, [activeDayIndex, setCurrentPlan]);

    const updateChoiceOption = useCallback((
        meal: MealType,
        optionId: string,
        updates: Partial<MealChoiceOption>
    ) => {
        setCurrentPlan(prev => {
            const newDays = [...prev.days];
            const mealData = newDays[activeDayIndex][meal];
            if (!mealData.choice) return prev;

            newDays[activeDayIndex] = {
                ...newDays[activeDayIndex],
                [meal]: {
                    ...mealData,
                    choice: {
                        ...mealData.choice,
                        options: mealData.choice.options.map(opt =>
                            opt.id === optionId ? { ...opt, ...updates } : opt
                        )
                    }
                }
            };
            return { ...prev, days: newDays };
        });
    }, [activeDayIndex, setCurrentPlan]);

    const removeChoiceOption = useCallback((meal: MealType, optionId: string) => {
        setCurrentPlan(prev => {
            const newDays = [...prev.days];
            const mealData = newDays[activeDayIndex][meal];
            if (!mealData.choice) return prev;

            const newOptions = mealData.choice.options.filter(opt => opt.id !== optionId);

            newDays[activeDayIndex] = {
                ...newDays[activeDayIndex],
                [meal]: {
                    ...mealData,
                    choice: {
                        ...mealData.choice,
                        options: newOptions
                    }
                }
            };

            // 如果刪除的是當前選中的選項，選中第一個或清空
            if (activeChoiceOption?.optionId === optionId) {
                if (newOptions.length > 0) {
                    setActiveChoiceOption({ meal, optionId: newOptions[0].id });
                } else {
                    setActiveChoiceOption(null);
                }
            }

            return { ...prev, days: newDays };
        });
    }, [activeDayIndex, activeChoiceOption, setCurrentPlan]);

    const removeChoiceEntry = useCallback((
        meal: MealType,
        optionId: string,
        entryId: string
    ) => {
        setCurrentPlan(prev => {
            const newDays = [...prev.days];
            const mealData = newDays[activeDayIndex][meal];
            if (!mealData.choice) return prev;

            newDays[activeDayIndex] = {
                ...newDays[activeDayIndex],
                [meal]: {
                    ...mealData,
                    choice: {
                        ...mealData.choice,
                        options: mealData.choice.options.map(opt =>
                            opt.id === optionId
                                ? { ...opt, entries: opt.entries.filter(e => e.id !== entryId) }
                                : opt
                        )
                    }
                }
            };
            return { ...prev, days: newDays };
        });
    }, [activeDayIndex, setCurrentPlan]);

    const updateChoiceEntryField = useCallback((
        meal: MealType,
        optionId: string,
        entryId: string,
        field: keyof MenuEntry,
        value: string
    ) => {
        setCurrentPlan(prev => {
            const newDays = [...prev.days];
            const mealData = newDays[activeDayIndex][meal];
            if (!mealData.choice) return prev;

            newDays[activeDayIndex] = {
                ...newDays[activeDayIndex],
                [meal]: {
                    ...mealData,
                    choice: {
                        ...mealData.choice,
                        options: mealData.choice.options.map(opt =>
                            opt.id === optionId
                                ? {
                                    ...opt,
                                    entries: opt.entries.map(e => {
                                        if (e.id === entryId) {
                                            const updatedEntry = { ...e, [field]: value };
                                            if (field === 'portionDescription') {
                                                const parsed = parseFloat(value);
                                                if (!isNaN(parsed)) {
                                                    updatedEntry.portionValue = parsed;
                                                }
                                            }
                                            return updatedEntry;
                                        }
                                        return e;
                                    })
                                }
                                : opt
                        )
                    }
                }
            };
            return { ...prev, days: newDays };
        });
    }, [activeDayIndex, setCurrentPlan]);

    const selectChoiceOption = useCallback((meal: MealType, optionId: string) => {
        setActiveChoiceOption({ meal, optionId });
    }, []);

    return {
        activeChoiceOption,
        setActiveChoiceOption,
        toggleChoiceMode,
        addChoiceOption,
        updateChoiceOption,
        removeChoiceOption,
        removeChoiceEntry,
        updateChoiceEntryField,
        selectChoiceOption
    };
};
