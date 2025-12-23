
import React, { useMemo } from 'react';
import { MenuPlan } from '../../types';

interface MacroConfiguratorProps {
  currentPlan: MenuPlan;
  onUpdatePlan: (newPlan: MenuPlan) => void;
}

const MacroConfigurator: React.FC<MacroConfiguratorProps> = ({ currentPlan, onUpdatePlan }) => {
  
  const targetGrams = useMemo(() => {
      const cal = currentPlan.targetCalories;
      return {
          protein: (cal * (currentPlan.macroRatio.protein / 100)) / 4,
          carbs: (cal * (currentPlan.macroRatio.carbs / 100)) / 4,
          fat: (cal * (currentPlan.macroRatio.fat / 100)) / 9,
      };
  }, [currentPlan.targetCalories, currentPlan.macroRatio]);

  const updateMacroRatio = (key: keyof typeof currentPlan.macroRatio, value: string) => {
      const val = parseInt(value);
      if (isNaN(val)) return;
      onUpdatePlan({
          ...currentPlan,
          macroRatio: { ...currentPlan.macroRatio, [key]: val }
      });
  };

  const totalPercentage = currentPlan.macroRatio.protein + currentPlan.macroRatio.carbs + currentPlan.macroRatio.fat;

  return (
    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-4">
      <div>
          <label className="text-[11px] font-bold text-gray-500 block mb-1">目標總熱量 (kcal)</label>
          <input 
            type="number"
            value={currentPlan.targetCalories}
            onChange={(e) => onUpdatePlan({...currentPlan, targetCalories: parseInt(e.target.value) || 0})}
            className="w-full border border-orange-200 rounded-lg p-2 text-xl font-black text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
      </div>
      <div>
          <label className="text-[11px] font-bold text-gray-500 flex justify-between mb-1">
              <span>三大營養素比例 (%)</span>
              <span className={`text-[10px] ${totalPercentage === 100 ? 'text-green-500' : 'text-red-500'}`}>
                  總和: {totalPercentage}%
              </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-1 rounded-lg border text-center shadow-sm">
                  <span className="text-[10px] text-gray-400 block pt-1">碳水</span>
                  <input type="number" className="w-full text-center font-bold text-gray-700 outline-none pb-1" value={currentPlan.macroRatio.carbs} onChange={(e) => updateMacroRatio('carbs', e.target.value)} />
              </div>
              <div className="bg-white p-1 rounded-lg border text-center shadow-sm">
                  <span className="text-[10px] text-gray-400 block pt-1">蛋白質</span>
                  <input type="number" className="w-full text-center font-bold text-gray-700 outline-none pb-1" value={currentPlan.macroRatio.protein} onChange={(e) => updateMacroRatio('protein', e.target.value)} />
              </div>
              <div className="bg-white p-1 rounded-lg border text-center shadow-sm">
                  <span className="text-[10px] text-gray-400 block pt-1">脂肪</span>
                  <input type="number" className="w-full text-center font-bold text-gray-700 outline-none pb-1" value={currentPlan.macroRatio.fat} onChange={(e) => updateMacroRatio('fat', e.target.value)} />
              </div>
          </div>
          {/* Calculated Grams Display */}
          <div className="grid grid-cols-3 gap-2 mt-2 text-center opacity-70">
                <div className="text-[10px] text-amber-600 font-bold">約 {targetGrams.carbs.toFixed(0)}g</div>
                <div className="text-[10px] text-emerald-600 font-bold">約 {targetGrams.protein.toFixed(0)}g</div>
                <div className="text-[10px] text-blue-600 font-bold">約 {targetGrams.fat.toFixed(0)}g</div>
          </div>
      </div>
    </div>
  );
};

export default MacroConfigurator;
