
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

// ============= 計算邏輯 =============

interface DerivedPortions {
    staple: number;
    meat: number;
    fat: number;
}

interface CalculationDetails {
    targetGrams: { protein: number; carbs: number; fat: number };
    fixedContribution: { protein: number; carbs: number; fat: number; calories: number };
    remaining: { protein: number; carbs: number; fat: number };
    formulas: {
        staple: string;
        meat: string;
        fat: string;
    };
}

/**
 * 根據固定份數（蔬菜、水果、乳品）計算動態份數（全穀、豆魚蛋肉、油脂）
 */
const calculateDerivedPortions = (
    targetCalories: number,
    macroRatio: { protein: number; carbs: number; fat: number },
    vegetable: number,
    fruit: number,
    dairyDetailed: { full: number; low: number; skim: number }
): { derived: DerivedPortions; details: CalculationDetails } => {
    // Step 1: 目標營養素
    const targetGrams = {
        protein: (targetCalories * (macroRatio.protein / 100)) / 4,
        carbs: (targetCalories * (macroRatio.carbs / 100)) / 4,
        fat: (targetCalories * (macroRatio.fat / 100)) / 9,
    };

    // Step 2: 固定份數的營養貢獻
    const dairyProtein = dairyDetailed.full * DAIRY_EXCHANGE.full.protein +
        dairyDetailed.low * DAIRY_EXCHANGE.low.protein +
        dairyDetailed.skim * DAIRY_EXCHANGE.skim.protein;
    const dairyCarbs = dairyDetailed.full * DAIRY_EXCHANGE.full.carbs +
        dairyDetailed.low * DAIRY_EXCHANGE.low.carbs +
        dairyDetailed.skim * DAIRY_EXCHANGE.skim.carbs;
    const dairyFat = dairyDetailed.full * DAIRY_EXCHANGE.full.fat +
        dairyDetailed.low * DAIRY_EXCHANGE.low.fat +
        dairyDetailed.skim * DAIRY_EXCHANGE.skim.fat;
    const dairyCalories = dairyDetailed.full * DAIRY_EXCHANGE.full.calories +
        dairyDetailed.low * DAIRY_EXCHANGE.low.calories +
        dairyDetailed.skim * DAIRY_EXCHANGE.skim.calories;

    const fixedContribution = {
        protein: vegetable * VEGETABLE_EXCHANGE.protein + dairyProtein,
        carbs: vegetable * VEGETABLE_EXCHANGE.carbs + fruit * FRUIT_EXCHANGE.carbs + dairyCarbs,
        fat: dairyFat,
        calories: vegetable * VEGETABLE_EXCHANGE.calories + fruit * FRUIT_EXCHANGE.calories + dairyCalories,
    };

    // Step 3: 剩餘需求
    const remaining = {
        protein: Math.max(0, targetGrams.protein - fixedContribution.protein),
        carbs: Math.max(0, targetGrams.carbs - fixedContribution.carbs),
        fat: Math.max(0, targetGrams.fat - fixedContribution.fat),
    };

    // 四捨五入到 0.5 單位
    const roundToHalf = (n: number) => Math.round(n * 2) / 2;

    // Step 4: 反推動態份數
    // 全穀：以碳水為主（每份 15g 碳水）
    const stapleRaw = Math.max(0, remaining.carbs / STAPLE_EXCHANGE.carbs);
    const staple = roundToHalf(stapleRaw);

    // 豆魚蛋肉：剩餘蛋白質扣除全穀貢獻（每份 7g 蛋白質，假設中脂）
    const proteinFromStaple = staple * STAPLE_EXCHANGE.protein;
    const meatRaw = Math.max(0, (remaining.protein - proteinFromStaple) / MEAT_EXCHANGE.medium.protein);
    const meat = roundToHalf(meatRaw);

    // 油脂：剩餘脂肪扣除肉類貢獻（假設中脂）
    const fatFromMeat = meat * MEAT_EXCHANGE.medium.fat;
    const fatRaw = Math.max(0, (remaining.fat - fatFromMeat) / FAT_EXCHANGE.fat);
    const fat = roundToHalf(fatRaw);

    const formulas = {
        staple: `(${targetGrams.carbs.toFixed(0)}g 目標碳水 - ${fixedContribution.carbs.toFixed(0)}g 固定) ÷ 15g/份 = ${stapleRaw.toFixed(1)} → ${staple} 份`,
        meat: `(${remaining.protein.toFixed(0)}g 剩餘蛋白 - ${proteinFromStaple.toFixed(0)}g 全穀) ÷ 7g/份 = ${meatRaw.toFixed(1)} → ${meat} 份`,
        fat: `(${remaining.fat.toFixed(0)}g 剩餘脂肪 - ${fatFromMeat.toFixed(0)}g 肉類) ÷ 5g/份 = ${fatRaw.toFixed(1)} → ${fat} 份`,
    };

    return {
        derived: { staple, meat, fat },
        details: { targetGrams, fixedContribution, remaining, formulas }
    };
};

// ============= UI 元件 =============

// 公式 Tooltip Modal
const FormulaTooltipModal: React.FC<{
    title: string;
    formula: string;
    details: CalculationDetails;
    category: 'staple' | 'meat' | 'fat';
    onClose: () => void;
}> = ({ title, formula, details, category, onClose }) => {
    const getExplanation = () => {
        switch (category) {
            case 'staple':
                return `全穀份數由「剩餘碳水需求」反推，每份全穀提供 ${STAPLE_EXCHANGE.carbs}g 碳水。`;
            case 'meat':
                return `豆魚蛋肉份數由「剩餘蛋白質需求」反推，每份(中脂)提供 ${MEAT_EXCHANGE.medium.protein}g 蛋白質。`;
            case 'fat':
                return `油脂份數由「剩餘脂肪需求」反推，每份提供 ${FAT_EXCHANGE.fat}g 脂肪。`;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-5 w-80 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                    <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <i className="fas fa-calculator text-emerald-500"></i>
                        {title} 計算公式
                    </span>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600">
                        {formula}
                    </div>
                    <p className="text-xs text-gray-500">{getExplanation()}</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t">
                        <div>
                            <div className="text-gray-400">目標碳水</div>
                            <div className="font-bold text-amber-600">{details.targetGrams.carbs.toFixed(0)}g</div>
                        </div>
                        <div>
                            <div className="text-gray-400">目標蛋白</div>
                            <div className="font-bold text-emerald-600">{details.targetGrams.protein.toFixed(0)}g</div>
                        </div>
                        <div>
                            <div className="text-gray-400">目標脂肪</div>
                            <div className="font-bold text-blue-600">{details.targetGrams.fat.toFixed(0)}g</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 原有的營養值 Tooltip
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

// ============= 主元件 =============

const PortionConfigurator: React.FC<PortionConfiguratorProps> = ({ currentPlan, dayStats, onUpdatePlan }) => {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [activeFormulaTooltip, setActiveFormulaTooltip] = useState<'staple' | 'meat' | 'fat' | null>(null);

    // 目標細分份數
    const targetDetailed: DetailedPortions = currentPlan.detailedPortions || {
        meatLow: 0, meatMedium: 0, meatHigh: 0,
        dairyFull: 0, dairyLow: 0, dairySkim: 0
    };

    // 實際細分份數 (來自 dayStats)
    const actualDetailed = dayStats.detailedPortions;

    // 手動覆寫狀態
    const manualOverrides = currentPlan.manualPortionOverrides || {};

    // 計算動態份數
    const { derived, details } = useMemo(() => {
        return calculateDerivedPortions(
            currentPlan.targetCalories,
            currentPlan.macroRatio,
            currentPlan.targetPortions.vegetable || 0,
            currentPlan.targetPortions.fruit || 0,
            {
                full: targetDetailed.dairyFull,
                low: targetDetailed.dairyLow,
                skim: targetDetailed.dairySkim
            }
        );
    }, [currentPlan.targetCalories, currentPlan.macroRatio, currentPlan.targetPortions.vegetable, currentPlan.targetPortions.fruit, targetDetailed]);

    // 取得實際顯示的份數（考慮手動覆寫）
    const getDisplayPortion = (cat: 'staple' | 'meat' | 'fat') => {
        if (manualOverrides[cat]) {
            return currentPlan.targetPortions[cat] || 0;
        }
        return derived[cat];
    };

    // 更新手動設定類別
    const updateManualPortion = (cat: 'vegetable' | 'fruit', value: string) => {
        const val = parseFloat(value);
        if (value === '' || !isNaN(val)) {
            onUpdatePlan({
                ...currentPlan,
                targetPortions: { ...currentPlan.targetPortions, [cat]: value === '' ? 0 : val }
            });
        }
    };

    // 更新乳品細分
    const updateDairyPortion = (key: keyof DetailedPortions, value: string) => {
        const val = parseFloat(value);
        const newVal = value === '' ? 0 : (isNaN(val) ? targetDetailed[key] : val);
        const newDetailed = { ...targetDetailed, [key]: newVal };
        const totalDairy = newDetailed.dairyFull + newDetailed.dairyLow + newDetailed.dairySkim;

        onUpdatePlan({
            ...currentPlan,
            detailedPortions: newDetailed,
            targetPortions: { ...currentPlan.targetPortions, dairy: totalDairy }
        });
    };

    // 更新自動計算類別（手動覆寫）
    const updateDerivedPortion = (cat: 'staple' | 'meat' | 'fat', value: string) => {
        const val = parseFloat(value);
        if (value === '' || !isNaN(val)) {
            const newOverrides = { ...manualOverrides, [cat]: true };
            onUpdatePlan({
                ...currentPlan,
                targetPortions: { ...currentPlan.targetPortions, [cat]: value === '' ? 0 : val },
                manualPortionOverrides: newOverrides
            });
        }
    };

    // 重置為自動計算
    const resetToAuto = (cat: 'staple' | 'meat' | 'fat') => {
        const newOverrides = { ...manualOverrides };
        delete newOverrides[cat];
        onUpdatePlan({
            ...currentPlan,
            targetPortions: { ...currentPlan.targetPortions, [cat]: derived[cat] },
            manualPortionOverrides: Object.keys(newOverrides).length > 0 ? newOverrides : undefined
        });
    };

    // 更新肉類細分
    const updateMeatPortion = (key: keyof DetailedPortions, value: string) => {
        const val = parseFloat(value);
        const newVal = value === '' ? 0 : (isNaN(val) ? targetDetailed[key] : val);
        const newDetailed = { ...targetDetailed, [key]: newVal };
        const totalMeat = newDetailed.meatLow + newDetailed.meatMedium + newDetailed.meatHigh;

        onUpdatePlan({
            ...currentPlan,
            detailedPortions: newDetailed,
            targetPortions: { ...currentPlan.targetPortions, meat: totalMeat }
        });
    };

    // 智慧分配肉類（全部填到中脂）
    const autoDistributeMeat = () => {
        const total = getDisplayPortion('meat');
        const newDetailed = {
            ...targetDetailed,
            meatLow: 0,
            meatMedium: total,
            meatHigh: 0
        };
        onUpdatePlan({
            ...currentPlan,
            detailedPortions: newDetailed,
            targetPortions: { ...currentPlan.targetPortions, meat: total }
        });
    };

    // Step 2: 從目標細分份數計算營養素預估
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

        const staple = manualOverrides.staple ? tp.staple : derived.staple;
        const fat = manualOverrides.fat ? tp.fat : derived.fat;

        return {
            protein: staple * 2 + meatProtein + tp.vegetable * 1 + dairyProtein,
            fat: meatFat + dairyFat + fat * 5,
            carbs: staple * 15 + tp.vegetable * 5 + tp.fruit * 15 + dairyCarbs,
            calories: staple * 70 + meatCal + tp.vegetable * 25 + tp.fruit * 60 + dairyCal + fat * 45,
        };
    }, [currentPlan.targetPortions, targetDetailed, derived, manualOverrides]);

    const calDiff = Math.abs(expectedFromPortions.calories - currentPlan.targetCalories);
    const isDeviationHigh = calDiff > (currentPlan.targetCalories * 0.1);

    const getExchangeValues = (cat: string) => {
        switch (cat) {
            case 'staple': return STAPLE_EXCHANGE;
            case 'vegetable': return VEGETABLE_EXCHANGE;
            case 'fruit': return FRUIT_EXCHANGE;
            case 'fat': return FAT_EXCHANGE;
            case 'meatLow': return MEAT_EXCHANGE.low;
            case 'meatMedium': return MEAT_EXCHANGE.medium;
            case 'meatHigh': return MEAT_EXCHANGE.high;
            case 'dairyFull': return DAIRY_EXCHANGE.full;
            case 'dairyLow': return DAIRY_EXCHANGE.low;
            case 'dairySkim': return DAIRY_EXCHANGE.skim;
            default: return { protein: 0, fat: 0, carbs: 0, calories: 0 };
        }
    };

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

            {activeFormulaTooltip && (
                <FormulaTooltipModal
                    title={getTooltipLabel(activeFormulaTooltip)}
                    formula={details.formulas[activeFormulaTooltip]}
                    details={details}
                    category={activeFormulaTooltip}
                    onClose={() => setActiveFormulaTooltip(null)}
                />
            )}

            {/* ===== 手動設定區塊 ===== */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-600 mb-3 uppercase tracking-wider">
                    <i className="fas fa-edit mr-1"></i> 手動設定
                </div>

                {/* 蔬菜 */}
                <div className="text-[11px] mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 font-medium">蔬菜</span>
                            <button onClick={() => setActiveTooltip('vegetable')} className="text-gray-400 hover:text-emerald-500 transition">
                                <i className="fas fa-info-circle text-[9px]"></i>
                            </button>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-bold" style={{ color: CATEGORY_COLORS.vegetable }}>{dayStats.portions.vegetable.toFixed(1)}</span>
                            <span className="text-gray-400">/</span>
                            <NumberInput
                                value={currentPlan.targetPortions.vegetable || 0}
                                onChange={(v) => updateManualPortion('vegetable', v)}
                                className="w-12 text-center bg-white border-b border-dashed border-gray-300 focus:border-emerald-500 outline-none font-bold text-gray-600"
                            />
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full transition-all duration-500" style={{
                            width: `${Math.min(100, ((dayStats.portions.vegetable || 0) / (currentPlan.targetPortions.vegetable || 1)) * 100)}%`,
                            backgroundColor: CATEGORY_COLORS.vegetable
                        }}></div>
                    </div>
                </div>

                {/* 水果 */}
                <div className="text-[11px] mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 font-medium">水果</span>
                            <button onClick={() => setActiveTooltip('fruit')} className="text-gray-400 hover:text-emerald-500 transition">
                                <i className="fas fa-info-circle text-[9px]"></i>
                            </button>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-bold" style={{ color: CATEGORY_COLORS.fruit }}>{dayStats.portions.fruit.toFixed(1)}</span>
                            <span className="text-gray-400">/</span>
                            <NumberInput
                                value={currentPlan.targetPortions.fruit || 0}
                                onChange={(v) => updateManualPortion('fruit', v)}
                                className="w-12 text-center bg-white border-b border-dashed border-gray-300 focus:border-emerald-500 outline-none font-bold text-gray-600"
                            />
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full transition-all duration-500" style={{
                            width: `${Math.min(100, ((dayStats.portions.fruit || 0) / (currentPlan.targetPortions.fruit || 1)) * 100)}%`,
                            backgroundColor: CATEGORY_COLORS.fruit
                        }}></div>
                    </div>
                </div>

                {/* 乳品類 */}
                <div className="mt-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <div className="text-[11px] font-bold text-blue-600 mb-2">乳品類</div>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { key: 'dairyFull', label: '全脂', exchangeKey: 'full' as const },
                            { key: 'dairyLow', label: '低脂', exchangeKey: 'low' as const },
                            { key: 'dairySkim', label: '脫脂', exchangeKey: 'skim' as const },
                        ].map(({ key, label, exchangeKey }) => {
                            const actual = actualDetailed[key as keyof DetailedPortions];
                            const target = targetDetailed[key as keyof DetailedPortions];
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
                                            onChange={(v) => updateDairyPortion(key as keyof DetailedPortions, v)}
                                            className="w-10 text-center font-bold text-blue-600 outline-none bg-transparent"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ===== 自動計算區塊 ===== */}
            <div className="mt-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <div className="text-[10px] font-bold text-amber-600 mb-3 uppercase tracking-wider">
                    <i className="fas fa-magic mr-1"></i> 自動計算
                </div>

                {/* 全穀 */}
                <div className="text-[11px] mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 font-medium">全穀雜糧</span>
                            <button onClick={() => setActiveFormulaTooltip('staple')} className="text-amber-400 hover:text-amber-600 transition">
                                <i className="fas fa-calculator text-[9px]"></i>
                            </button>
                            {manualOverrides.staple && (
                                <button onClick={() => resetToAuto('staple')} className="text-orange-400 hover:text-orange-600 transition" title="重置為自動計算">
                                    <i className="fas fa-lock text-[9px]"></i>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-bold" style={{ color: CATEGORY_COLORS.staple }}>{dayStats.portions.staple.toFixed(1)}</span>
                            <span className="text-gray-400">/</span>
                            <NumberInput
                                value={parseFloat(getDisplayPortion('staple').toFixed(1))}
                                onChange={(v) => updateDerivedPortion('staple', v)}
                                className={`w-12 text-center border-b border-dashed outline-none font-bold ${manualOverrides.staple ? 'bg-orange-50 border-orange-300 text-orange-600' : 'bg-white border-gray-300 text-gray-600'}`}
                            />
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full transition-all duration-500" style={{
                            width: `${Math.min(100, ((dayStats.portions.staple || 0) / (getDisplayPortion('staple') || 1)) * 100)}%`,
                            backgroundColor: CATEGORY_COLORS.staple
                        }}></div>
                    </div>
                </div>

                {/* 豆魚蛋肉類 */}
                <div className="mt-3 bg-red-50/50 p-3 rounded-xl border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-red-600">豆魚蛋肉類</span>
                            <button onClick={() => setActiveFormulaTooltip('meat')} className="text-amber-400 hover:text-amber-600 transition">
                                <i className="fas fa-calculator text-[9px]"></i>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">建議總份:</span>
                            <span className="text-[11px] font-bold text-red-600">{derived.meat.toFixed(1)}</span>
                            <button onClick={autoDistributeMeat} className="text-[9px] bg-red-100 hover:bg-red-200 text-red-600 px-2 py-0.5 rounded transition">
                                全填中脂
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { key: 'meatLow', label: '低脂', exchangeKey: 'low' as const },
                            { key: 'meatMedium', label: '中脂', exchangeKey: 'medium' as const },
                            { key: 'meatHigh', label: '高脂', exchangeKey: 'high' as const },
                        ].map(({ key, label, exchangeKey }) => {
                            const actual = actualDetailed[key as keyof DetailedPortions];
                            const target = targetDetailed[key as keyof DetailedPortions];
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
                                            onChange={(v) => updateMeatPortion(key as keyof DetailedPortions, v)}
                                            className="w-10 text-center font-bold text-red-600 outline-none bg-transparent"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 油脂 */}
                <div className="text-[11px] mt-3">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 font-medium">油脂與堅果</span>
                            <button onClick={() => setActiveFormulaTooltip('fat')} className="text-amber-400 hover:text-amber-600 transition">
                                <i className="fas fa-calculator text-[9px]"></i>
                            </button>
                            {manualOverrides.fat && (
                                <button onClick={() => resetToAuto('fat')} className="text-orange-400 hover:text-orange-600 transition" title="重置為自動計算">
                                    <i className="fas fa-lock text-[9px]"></i>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-bold" style={{ color: CATEGORY_COLORS.fat }}>{dayStats.portions.fat.toFixed(1)}</span>
                            <span className="text-gray-400">/</span>
                            <NumberInput
                                value={parseFloat(getDisplayPortion('fat').toFixed(1))}
                                onChange={(v) => updateDerivedPortion('fat', v)}
                                className={`w-12 text-center border-b border-dashed outline-none font-bold ${manualOverrides.fat ? 'bg-orange-50 border-orange-300 text-orange-600' : 'bg-white border-gray-300 text-gray-600'}`}
                            />
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full transition-all duration-500" style={{
                            width: `${Math.min(100, ((dayStats.portions.fat || 0) / (getDisplayPortion('fat') || 1)) * 100)}%`,
                            backgroundColor: CATEGORY_COLORS.fat
                        }}></div>
                    </div>
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
                        <div className={`font-bold ${Math.abs(expectedFromPortions.carbs - details.targetGrams.carbs) > 10 ? 'text-red-500' : 'text-gray-600'}`}>
                            {expectedFromPortions.carbs.toFixed(0)}g
                        </div>
                        <div className="text-[9px] text-gray-300">目標 {details.targetGrams.carbs.toFixed(0)}g</div>
                    </div>
                    <div>
                        <div className="text-gray-400 mb-0.5">蛋白</div>
                        <div className={`font-bold ${Math.abs(expectedFromPortions.protein - details.targetGrams.protein) > 10 ? 'text-red-500' : 'text-gray-600'}`}>
                            {expectedFromPortions.protein.toFixed(0)}g
                        </div>
                        <div className="text-[9px] text-gray-300">目標 {details.targetGrams.protein.toFixed(0)}g</div>
                    </div>
                    <div>
                        <div className="text-gray-400 mb-0.5">脂肪</div>
                        <div className={`font-bold ${Math.abs(expectedFromPortions.fat - details.targetGrams.fat) > 10 ? 'text-red-500' : 'text-gray-600'}`}>
                            {expectedFromPortions.fat.toFixed(0)}g
                        </div>
                        <div className="text-[9px] text-gray-300">目標 {details.targetGrams.fat.toFixed(0)}g</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PortionConfigurator;
