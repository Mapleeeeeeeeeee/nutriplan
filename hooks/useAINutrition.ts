import { useState } from 'react';
import { getNutritionInfo } from '../services/geminiService';
import { FoodItem } from '../types';

export const useAINutrition = () => {
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    const fetchNutritionData = async (foodName: string): Promise<Partial<FoodItem> | null> => {
        if (!foodName) return null;

        setIsLoadingAI(true);
        try {
            const data = await getNutritionInfo(foodName);
            return data;
        } catch (error) {
            alert("AI 查詢失敗，請檢查網路。");
            return null;
        } finally {
            setIsLoadingAI(false);
        }
    };

    return { isLoadingAI, fetchNutritionData };
};
