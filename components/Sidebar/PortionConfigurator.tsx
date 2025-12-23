
import React, { useMemo } from 'react';
import { FoodCategory, MenuPlan } from '../../types';
import { CATEGORY_LABELS, CATEGORY_COLORS, EXCHANGE_STANDARDS } from '../../constants';

interface PortionConfiguratorProps {
  currentPlan: MenuPlan;
  dayStats: {
      portions: Record<FoodCategory, number>;
  };
  onUpdatePlan: (newPlan: MenuPlan) => void;
}

const PortionConfigurator: React.FC<PortionConfiguratorProps> = ({ currentPlan, dayStats, onUpdatePlan }) => {

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

  // Step 1 Goals (for comparison)
  const targetGrams = useMemo(() => {
      const cal = currentPlan.targetCalories;
      return {
          protein: (cal * (currentPlan.macroRatio.protein / 100)) / 4,
          carbs: (cal * (currentPlan.macroRatio.carbs / 100)) / 4,
          fat: (cal * (currentPlan.macroRatio.fat / 100)) / 9,
      };
  }, [currentPlan.targetCalories, currentPlan.macroRatio]);

  // Step 2 Verification
  const portionStats = useMemo(() => {
    let p = 0, c = 0, f = 0, cal = 0;
    Object.entries(currentPlan.targetPortions).forEach(([cat, amount]) => {
        const std = EXCHANGE_STANDARDS[cat as FoodCategory];
        if (std) {
            p += std.p * amount;
            c += std.c * amount;
            f += std.f * amount;
            cal += std.cal * amount;
        }
    });
    return { p, c, f, cal };
  }, [currentPlan.targetPortions]);

  const calDiff = Math.abs(portionStats.cal - currentPlan.targetCalories);
  const isDeviationHigh = calDiff > (currentPlan.targetCalories * 0.1);

  return (
    <>
        <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
                const actual = dayStats.portions[cat as FoodCategory] || 0;
                const target = currentPlan.targetPortions[cat as FoodCategory] ?? 0;
                // Avoid division by zero, cap at 100% for the bar visual
                const percentage = target > 0 ? Math.min(100, (actual / target) * 100) : 0;
                
                return (
                    <div key={cat} className="text-[11px]">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 font-medium">{label}</span>
                        <div className="flex items-center gap-1">
                            {/* Actual / Target */}
                            <span className="font-bold" style={{color: CATEGORY_COLORS[cat]}}>{actual.toFixed(1)}</span>
                            <span className="text-gray-400">/</span>
                            <input 
                            type="number"
                            step="0.5"
                            min="0"
                            className="w-12 text-center bg-white border-b border-dashed border-gray-300 focus:border-emerald-500 outline-none font-bold text-gray-600 hover:bg-gray-100 transition"
                            value={target}
                            onChange={(e) => updateTargetPortion(cat as FoodCategory, e.target.value)}
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

        {/* Validation Box */}
        <div className={`mt-4 p-4 rounded-xl border text-[11px] ${isDeviationHigh ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-600">驗算：份數總熱量</span>
                <span className={`font-black text-lg ${isDeviationHigh ? 'text-red-500' : 'text-emerald-600'}`}>{portionStats.cal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between mb-3 text-gray-400">
                <span>步驟1 目標</span>
                <span>{currentPlan.targetCalories} kcal</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-200/50">
                <div>
                    <div className="text-gray-400 mb-0.5">碳水</div>
                    <div className={`font-bold ${Math.abs(portionStats.c - targetGrams.carbs) > 10 ? 'text-red-500' : 'text-gray-600'}`}>
                        {portionStats.c.toFixed(0)}g
                    </div>
                    <div className="text-[9px] text-gray-300">目標 {targetGrams.carbs.toFixed(0)}</div>
                </div>
                <div>
                    <div className="text-gray-400 mb-0.5">蛋白</div>
                    <div className={`font-bold ${Math.abs(portionStats.p - targetGrams.protein) > 10 ? 'text-red-500' : 'text-gray-600'}`}>
                        {portionStats.p.toFixed(0)}g
                    </div>
                    <div className="text-[9px] text-gray-300">目標 {targetGrams.protein.toFixed(0)}</div>
                </div>
                <div>
                    <div className="text-gray-400 mb-0.5">脂肪</div>
                    <div className={`font-bold ${Math.abs(portionStats.f - targetGrams.fat) > 10 ? 'text-red-500' : 'text-gray-600'}`}>
                        {portionStats.f.toFixed(0)}g
                    </div>
                    <div className="text-[9px] text-gray-300">目標 {targetGrams.fat.toFixed(0)}</div>
                </div>
            </div>
        </div>
    </>
  );
};

export default PortionConfigurator;
