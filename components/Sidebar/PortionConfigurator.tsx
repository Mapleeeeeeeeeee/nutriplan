
import React, { useMemo, useState } from 'react';
import { FoodCategory, MenuPlan, NutritionTotals, DetailedPortions } from '../../types';
import {
    CATEGORY_LABELS, CATEGORY_COLORS, MEAT_EXCHANGE, DAIRY_EXCHANGE,
    STAPLE_EXCHANGE, VEGETABLE_EXCHANGE, FRUIT_EXCHANGE, FAT_EXCHANGE
} from '../../constants';

interface PortionConfiguratorProps {
    currentPlan: MenuPlan;
    dayStats: {
        totals: NutritionTotals;
        portions: Record<FoodCategory, number>;
        detailedPortions: DetailedPortions;
    };
    onUpdatePlan: (newPlan: MenuPlan) => void;
}

// Modal 式 Tooltip
const ExchangeTooltipModal: React.FC<{
    label: string;
    values: { protein: number; fat: number; carbs: number; calories: number };
    onClose: () => void;
}> = ({ label, values, onClose }) => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl p-5 w-64 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <span className="font-bold text-gray-700 text-sm">{label} 每份營養</span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">蛋白質</span>
                    <span className="font-bold text-emerald-600">{values.protein}g</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">脂肪</span>
                    <span className="font-bold text-blue-600">{values.fat}g</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">醣類</span>
                    <span className="font-bold text-amber-600">{values.carbs}g</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-600 font-medium">熱量</span>
                    <span className="font-black text-orange-600 text-lg">{values.calories}kcal</span>
                </div>
            </div>
        </div>
    </div>
);

// 數字輸入元件
const NumberInput: React.FC<{
    value: number;
    onChange: (value: string) => void;
    className?: string;
    step?: string;
    min?: string;
}> = ({ value, onChange, className, step = "0.5", min = "0" }) => {
    const [localValue, setLocalValue] = useState(value.toString());
    const [isFocused, setIsFocused] = useState(false);

    React.useEffect(() => {
        if (!isFocused) {
            setLocalValue(value.toString());
        }
    }, [value, isFocused]);

    return (
        <input
            type="number"
            step={step}
            min={min}
            className={className}
            value={isFocused ? localValue : value}
            onChange={(e) => {
                setLocalValue(e.target.value);
                onChange(e.target.value);
            }}
            onFocus={(e) => {
                setIsFocused(true);
                e.target.select();
            }}
            onBlur={() => {
                setIsFocused(false);
                if (localValue === '' || isNaN(parseFloat(localValue))) {
                    setLocalValue('0');
                }
            }}
        />
    );
};

const PortionConfigurator: React.FC<PortionConfiguratorProps> = ({ currentPlan, dayStats, onUpdatePlan }) => {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    // 目標細分份數
    const targetDetailed: DetailedPortions = currentPlan.detailedPortions || {
        meatLow: 0, meatMedium: 0, meatHigh: 0,
        dairyFull: 0, dairyLow: 0, dairySkim: 0
    };

    // 實際細分份數 (來自 dayStats)
    const actualDetailed = dayStats.detailedPortions;

    const updateTargetPortion = (cat: FoodCategory, value: string) => {
        const val = parseFloat(value);
        if (value === '') {
            onUpdatePlan({
                ...currentPlan,
                targetPortions: { ...currentPlan.targetPortions, [cat]: 0 }
            });
            return;
        }

        if (!isNaN(val)) {
            onUpdatePlan({
                ...currentPlan,
                targetPortions: { ...currentPlan.targetPortions, [cat]: val }
            });
        }
    };

    const updateDetailedPortion = (key: keyof DetailedPortions, value: string) => {
        const val = parseFloat(value);
        const newVal = value === '' ? 0 : (isNaN(val) ? targetDetailed[key] : val);
        const newDetailed = { ...targetDetailed, [key]: newVal };

        // 同步更新總份數
        const totalMeat = newDetailed.meatLow + newDetailed.meatMedium + newDetailed.meatHigh;
        const totalDairy = newDetailed.dairyFull + newDetailed.dairyLow + newDetailed.dairySkim;

        onUpdatePlan({
            ...currentPlan,
            detailedPortions: newDetailed,
            targetPortions: {
                ...currentPlan.targetPortions,
                meat: totalMeat,
                dairy: totalDairy
            }
        });
    };

    // Step 1 Goals
    const targetGrams = useMemo(() => {
        const cal = currentPlan.targetCalories;
        return {
            protein: (cal * (currentPlan.macroRatio.protein / 100)) / 4,
            carbs: (cal * (currentPlan.macroRatio.carbs / 100)) / 4,
            fat: (cal * (currentPlan.macroRatio.fat / 100)) / 9,
        };
    }, [currentPlan.targetCalories, currentPlan.macroRatio]);

    // Step 2: 從目標細分份數計算營養素
    const expectedFromPortions = useMemo(() => {
        const tp = currentPlan.targetPortions;
        const dp = targetDetailed;

        const meatProtein = dp.meatLow * MEAT_EXCHANGE.low.protein +
            dp.meatMedium * MEAT_EXCHANGE.medium.protein +
            dp.meatHigh * MEAT_EXCHANGE.high.protein;
        const meatFat = dp.meatLow * MEAT_EXCHANGE.low.fat +
            dp.meatMedium * MEAT_EXCHANGE.medium.fat +
            dp.meatHigh * MEAT_EXCHANGE.high.fat;
        const meatCal = dp.meatLow * MEAT_EXCHANGE.low.calories +
            dp.meatMedium * MEAT_EXCHANGE.medium.calories +
            dp.meatHigh * MEAT_EXCHANGE.high.calories;

        const dairyProtein = dp.dairyFull * DAIRY_EXCHANGE.full.protein +
            dp.dairyLow * DAIRY_EXCHANGE.low.protein +
            dp.dairySkim * DAIRY_EXCHANGE.skim.protein;
        const dairyFat = dp.dairyFull * DAIRY_EXCHANGE.full.fat +
            dp.dairyLow * DAIRY_EXCHANGE.low.fat +
            dp.dairySkim * DAIRY_EXCHANGE.skim.fat;
        const dairyCarbs = dp.dairyFull * DAIRY_EXCHANGE.full.carbs +
            dp.dairyLow * DAIRY_EXCHANGE.low.carbs +
            dp.dairySkim * DAIRY_EXCHANGE.skim.carbs;
        const dairyCal = dp.dairyFull * DAIRY_EXCHANGE.full.calories +
            dp.dairyLow * DAIRY_EXCHANGE.low.calories +
            dp.dairySkim * DAIRY_EXCHANGE.skim.calories;

        return {
            protein: tp.staple * 2 + meatProtein + tp.vegetable * 1 + dairyProtein,
            fat: meatFat + dairyFat + tp.fat * 5,
            carbs: tp.staple * 15 + tp.vegetable * 5 + tp.fruit * 15 + dairyCarbs,
            calories: tp.staple * 70 + meatCal + tp.vegetable * 25 + tp.fruit * 60 + dairyCal + tp.fat * 45,
        };
    }, [currentPlan.targetPortions, targetDetailed]);

    const calDiff = Math.abs(expectedFromPortions.calories - currentPlan.targetCalories);
    const isDeviationHigh = calDiff > (currentPlan.targetCalories * 0.1);

    const getExchangeValues = (cat: string) => {
        switch (cat) {
            case 'staple': return STAPLE_EXCHANGE;
            case 'vegetable': return VEGETABLE_EXCHANGE;
            case 'fruit': return FRUIT_EXCHANGE;
            case 'fat': return FAT_EXCHANGE;
            // Meat fat levels
            case 'meatLow': return MEAT_EXCHANGE.low;
            case 'meatMedium': return MEAT_EXCHANGE.medium;
            case 'meatHigh': return MEAT_EXCHANGE.high;
            // Dairy fat levels
            case 'dairyFull': return DAIRY_EXCHANGE.full;
            case 'dairyLow': return DAIRY_EXCHANGE.low;
            case 'dairySkim': return DAIRY_EXCHANGE.skim;
            default: return { protein: 0, fat: 0, carbs: 0, calories: 0 };
        }
    };

    const simpleCategories = ['staple', 'vegetable', 'fruit', 'fat'];
    // 取得 tooltip 標籤
    const getTooltipLabel = (key: string) => {
        const labels: Record<string, string> = {
            staple: '全穀雜糧',
            vegetable: '蔬菜',
            fruit: '水果',
            fat: '油脂與堅果',
            meatLow: '豆魚蛋肉 (低脂)',
            meatMedium: '豆魚蛋肉 (中脂)',
            meatHigh: '豆魚蛋肉 (高脂)',
            dairyFull: '乳品 (全脂)',
            dairyLow: '乳品 (低脂)',
            dairySkim: '乳品 (脫脂)',
        };
        return labels[key] || key;
    };

    return (
        <>
            {activeTooltip && (
                <ExchangeTooltipModal
                    label={getTooltipLabel(activeTooltip)}
                    values={getExchangeValues(activeTooltip)}
                    onClose={() => setActiveTooltip(null)}
                />
            )}

            {/* 簡單類別 */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {simpleCategories.map(cat => {
                    const label = CATEGORY_LABELS[cat];
                    if (!label) return null;
                    const actual = dayStats.portions[cat as FoodCategory] || 0;
                    const target = currentPlan.targetPortions[cat as FoodCategory] ?? 0;
                    const percentage = target > 0 ? Math.min(100, (actual / target) * 100) : 0;

                    return (
                        <div key={cat} className="text-[11px]">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500 font-medium">{label}</span>
                                    <button onClick={() => setActiveTooltip(cat)} className="text-gray-400 hover:text-emerald-500 transition">
                                        <i className="fas fa-info-circle text-[9px]"></i>
                                    </button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold" style={{ color: CATEGORY_COLORS[cat] }}>{actual.toFixed(1)}</span>
                                    <span className="text-gray-400">/</span>
                                    <NumberInput
                                        value={target}
                                        onChange={(v) => updateTargetPortion(cat as FoodCategory, v)}
                                        className="w-12 text-center bg-white border-b border-dashed border-gray-300 focus:border-emerald-500 outline-none font-bold text-gray-600 hover:bg-gray-100 transition"
                                    />
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: CATEGORY_COLORS[cat] }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 豆魚蛋肉類 - 各脂肪等級獨立 */}
            <div className="mt-3 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <div className="text-[11px] font-bold text-red-600 mb-3">豆魚蛋肉類</div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: 'meatLow', label: '低脂', exchangeKey: 'low' as const },
                        { key: 'meatMedium', label: '中脂', exchangeKey: 'medium' as const },
                        { key: 'meatHigh', label: '高脂', exchangeKey: 'high' as const },
                    ].map(({ key, label, exchangeKey }) => {
                        const actual = actualDetailed[key as keyof DetailedPortions];
                        const target = targetDetailed[key as keyof DetailedPortions];
                        const percentage = target > 0 ? Math.min(100, (actual / target) * 100) : 0;
                        const exchange = MEAT_EXCHANGE[exchangeKey];
                        return (
                            <div key={key} className="bg-white rounded-lg p-2 border border-red-100">
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-[9px] text-gray-400">{label}</span>
                                    <button onClick={() => setActiveTooltip(key)} className="text-gray-300 hover:text-red-500 transition">
                                        <i className="fas fa-info-circle text-[8px]"></i>
                                    </button>
                                </div>
                                <div className="text-[8px] text-gray-300 text-center mb-1">{exchange.calories}kcal/份</div>
                                <div className="flex items-center justify-center gap-1 text-[11px]">
                                    <span className="font-bold text-red-500">{actual.toFixed(1)}</span>
                                    <span className="text-gray-400">/</span>
                                    <NumberInput
                                        value={target}
                                        onChange={(v) => updateDetailedPortion(key as keyof DetailedPortions, v)}
                                        className="w-10 text-center font-bold text-red-600 outline-none bg-transparent"
                                    />
                                </div>
                                <div className="w-full bg-red-100 rounded-full h-1 mt-1 overflow-hidden">
                                    <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 乳品類 - 各脂肪等級獨立 */}
            <div className="mt-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="text-[11px] font-bold text-blue-600 mb-3">乳品類</div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: 'dairyFull', label: '全脂', exchangeKey: 'full' as const },
                        { key: 'dairyLow', label: '低脂', exchangeKey: 'low' as const },
                        { key: 'dairySkim', label: '脫脂', exchangeKey: 'skim' as const },
                    ].map(({ key, label, exchangeKey }) => {
                        const actual = actualDetailed[key as keyof DetailedPortions];
                        const target = targetDetailed[key as keyof DetailedPortions];
                        const percentage = target > 0 ? Math.min(100, (actual / target) * 100) : 0;
                        const exchange = DAIRY_EXCHANGE[exchangeKey];
                        return (
                            <div key={key} className="bg-white rounded-lg p-2 border border-blue-100">
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-[9px] text-gray-400">{label}</span>
                                    <button onClick={() => setActiveTooltip(key)} className="text-gray-300 hover:text-blue-500 transition">
                                        <i className="fas fa-info-circle text-[8px]"></i>
                                    </button>
                                </div>
                                <div className="text-[8px] text-gray-300 text-center mb-1">{exchange.calories}kcal/份</div>
                                <div className="flex items-center justify-center gap-1 text-[11px]">
                                    <span className="font-bold text-blue-500">{actual.toFixed(1)}</span>
                                    <span className="text-gray-400">/</span>
                                    <NumberInput
                                        value={target}
                                        onChange={(v) => updateDetailedPortion(key as keyof DetailedPortions, v)}
                                        className="w-10 text-center font-bold text-blue-600 outline-none bg-transparent"
                                    />
                                </div>
                                <div className="w-full bg-blue-100 rounded-full h-1 mt-1 overflow-hidden">
                                    <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Validation Box */}
            <div className={`mt-4 p-4 rounded-xl border text-[11px] ${isDeviationHigh ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-600">份數預計：總熱量</span>
                    <span className={`font-black text-lg ${isDeviationHigh ? 'text-red-500' : 'text-emerald-600'}`}>{expectedFromPortions.calories.toFixed(0)}</span>
                </div>
                <div className="flex justify-between mb-3 text-gray-400">
                    <span>步驟1 目標</span>
                    <span>{currentPlan.targetCalories} kcal</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-200/50">
                    <div>
                        <div className="text-gray-400 mb-0.5">碳水</div>
                        <div className={`font-bold ${Math.abs(expectedFromPortions.carbs - targetGrams.carbs) > 10 ? 'text-red-500' : 'text-gray-600'}`}>
                            {expectedFromPortions.carbs.toFixed(0)}g
                        </div>
                        <div className="text-[9px] text-gray-300">目標 {targetGrams.carbs.toFixed(0)}g</div>
                    </div>
                    <div>
                        <div className="text-gray-400 mb-0.5">蛋白</div>
                        <div className={`font-bold ${Math.abs(expectedFromPortions.protein - targetGrams.protein) > 10 ? 'text-red-500' : 'text-gray-600'}`}>
                            {expectedFromPortions.protein.toFixed(0)}g
                        </div>
                        <div className="text-[9px] text-gray-300">目標 {targetGrams.protein.toFixed(0)}g</div>
                    </div>
                    <div>
                        <div className="text-gray-400 mb-0.5">脂肪</div>
                        <div className={`font-bold ${Math.abs(expectedFromPortions.fat - targetGrams.fat) > 10 ? 'text-red-500' : 'text-gray-600'}`}>
                            {expectedFromPortions.fat.toFixed(0)}g
                        </div>
                        <div className="text-[9px] text-gray-300">目標 {targetGrams.fat.toFixed(0)}g</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PortionConfigurator;
