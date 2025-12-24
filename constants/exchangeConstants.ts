/**
 * 食物代換表標準值
 * 依據：衛生福利部國民健康署 2019.5 版
 * 
 * 每份營養素含量 (蛋白質/脂肪/醣類/熱量)
 * + 表微量
 */

// ============= 類型定義 =============

export type DairyFatLevel = 'full' | 'low' | 'skim';
export type MeatFatLevel = 'low' | 'medium' | 'high';
export type FatLevel = DairyFatLevel | MeatFatLevel;

export interface ExchangeValue {
    readonly protein: number;  // 蛋白質 (公克)
    readonly fat: number;      // 脂肪 (公克)
    readonly carbs: number;    // 醣類 (公克)
    readonly calories: number; // 熱量 (大卡)
}

// ============= 乳品類 =============
// 1份 = 240ml 鮮乳

export const DAIRY_FAT_LEVELS = ['full', 'low', 'skim'] as const;

export const DAIRY_EXCHANGE: Record<DairyFatLevel, ExchangeValue> = {
    full: { protein: 8, fat: 8, carbs: 12, calories: 150 },  // 全脂
    low: { protein: 8, fat: 4, carbs: 12, calories: 120 },   // 低脂
    skim: { protein: 8, fat: 0, carbs: 12, calories: 80 },   // 脫脂
} as const;

export const DAIRY_FAT_LABELS: Record<DairyFatLevel, string> = {
    full: '全脂',
    low: '低脂',
    skim: '脫脂',
};

// ============= 豆魚蛋肉類 =============
// 1份 = 約35g (低脂) / 55g (雞蛋)

export const MEAT_FAT_LEVELS = ['low', 'medium', 'high'] as const;

export const MEAT_EXCHANGE: Record<MeatFatLevel, ExchangeValue> = {
    low: { protein: 7, fat: 3, carbs: 0, calories: 55 },     // 低脂
    medium: { protein: 7, fat: 5, carbs: 0, calories: 75 },  // 中脂
    high: { protein: 7, fat: 10, carbs: 0, calories: 120 },  // 高脂
} as const;

export const MEAT_FAT_LABELS: Record<MeatFatLevel, string> = {
    low: '低脂',
    medium: '中脂',
    high: '高脂',
};

// ============= 其他類別 (單一標準) =============

/** 全穀雜糧類 - 1份 = 40g 白飯 */
export const STAPLE_EXCHANGE: ExchangeValue = {
    protein: 2,
    fat: 0,
    carbs: 15,
    calories: 70,
} as const;

/** 蔬菜類 - 1份 = 100g 熟菜 */
export const VEGETABLE_EXCHANGE: ExchangeValue = {
    protein: 1,
    fat: 0,
    carbs: 5,
    calories: 25,
} as const;

/** 水果類 - 1份 = 約100g */
export const FRUIT_EXCHANGE: ExchangeValue = {
    protein: 0,
    fat: 0,
    carbs: 15,
    calories: 60,
} as const;

/** 油脂與堅果種子類 - 1份 = 5g 油 or 10g 堅果 */
export const FAT_EXCHANGE: ExchangeValue = {
    protein: 0,
    fat: 5,
    carbs: 0,
    calories: 45,
} as const;

// ============= 依類別取得標準值 =============

import { FoodCategory } from '../types';

/**
 * 根據食物類別和脂肪等級取得標準代換值
 */
export const getExchangeValue = (
    category: FoodCategory,
    fatLevel?: FatLevel
): ExchangeValue => {
    switch (category) {
        case 'dairy':
            return DAIRY_EXCHANGE[(fatLevel as DairyFatLevel) || 'low'];
        case 'meat':
            return MEAT_EXCHANGE[(fatLevel as MeatFatLevel) || 'medium'];
        case 'staple':
            return STAPLE_EXCHANGE;
        case 'vegetable':
            return VEGETABLE_EXCHANGE;
        case 'fruit':
            return FRUIT_EXCHANGE;
        case 'fat':
            return FAT_EXCHANGE;
        default:
            return { protein: 0, fat: 0, carbs: 0, calories: 0 };
    }
};
