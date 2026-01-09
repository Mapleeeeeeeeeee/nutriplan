import React, { useState, useCallback } from 'react';
import { MenuPlan, DailyItems, MealData } from '../types';

// ============= 常數定義 =============

const DEFAULT_TARGET_CALORIES = 1500;
const DEFAULT_MACRO_RATIO = { protein: 20, carbs: 50, fat: 30 };
const DEFAULT_TARGET_PORTIONS = {
    staple: 3, meat: 5, vegetable: 3, fruit: 2, dairy: 1, fat: 3, other: 0
};

// ============= 輔助函數 =============

/** 創建空的 MealData */
export const createEmptyMealData = (): MealData => ({ entries: [] });

/** 創建空的 DailyItems */
export const createEmptyDay = (): DailyItems => ({
    breakfast: createEmptyMealData(),
    morningSnack: createEmptyMealData(),
    lunch: createEmptyMealData(),
    afternoonSnack: createEmptyMealData(),
    dinner: createEmptyMealData(),
    eveningSnack: createEmptyMealData()
});

/** 創建預設的 MenuPlan */
export const createDefaultPlan = (): MenuPlan => ({
    id: '',
    name: '新計畫菜單',
    type: 'single',
    cycleDays: 1,
    targetCalories: DEFAULT_TARGET_CALORIES,
    macroRatio: DEFAULT_MACRO_RATIO,
    targetPortions: DEFAULT_TARGET_PORTIONS,
    createdAt: Date.now(),
    days: [createEmptyDay()],
    notes: ['']
});

// ============= Hook 定義 =============

export interface UseMenuPlanReturn {
    currentPlan: MenuPlan;
    setCurrentPlan: React.Dispatch<React.SetStateAction<MenuPlan>>;
    activeDayIndex: number;
    setActiveDayIndex: React.Dispatch<React.SetStateAction<number>>;
    updatePlan: (updates: Partial<MenuPlan>) => void;
    updateNote: (dayIdx: number, text: string) => void;
}

/**
 * 核心狀態管理 Hook
 * 負責 MenuPlan 的狀態和基本操作
 */
export const useMenuPlan = (initialPlan?: MenuPlan): UseMenuPlanReturn => {
    const [currentPlan, setCurrentPlan] = useState<MenuPlan>(
        initialPlan || createDefaultPlan()
    );
    const [activeDayIndex, setActiveDayIndex] = useState(0);

    const updatePlan = useCallback((updates: Partial<MenuPlan>) => {
        setCurrentPlan(prev => ({ ...prev, ...updates }));
    }, []);

    const updateNote = useCallback((dayIdx: number, text: string) => {
        setCurrentPlan(prev => {
            const newNotes = [...(prev.notes || new Array(prev.days.length).fill(''))];
            newNotes[dayIdx] = text;
            return { ...prev, notes: newNotes };
        });
    }, []);

    return {
        currentPlan,
        setCurrentPlan,
        activeDayIndex,
        setActiveDayIndex,
        updatePlan,
        updateNote
    };
};
