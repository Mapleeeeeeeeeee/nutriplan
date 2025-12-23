
import React, { useState } from 'react';
import { FoodItem, MealType, CookingMethod } from '../../types';
import { CATEGORY_LABELS, MEAL_LABELS, COOKING_MODIFIERS } from '../../constants';

interface AddFoodFormProps {
  foods: FoodItem[];
  activeDayIndex: number;
  onAdd: (meal: MealType, foodId: string, method: CookingMethod, portionDesc: string) => void;
}

const AddFoodForm: React.FC<AddFoodFormProps> = ({ foods, activeDayIndex, onAdd }) => {
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [selectedMethod, setSelectedMethod] = useState<CookingMethod>('boiled');
  const [portionDesc, setPortionDesc] = useState<string>('1');

  const handleAddFood = () => {
    if (!selectedFoodId) return;
    onAdd(selectedMeal, selectedFoodId, selectedMethod, portionDesc);
    setSelectedFoodId('');
    setPortionDesc('1');
  };

  return (
    <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Day {activeDayIndex + 1}</span>
        </div>
        <select className="w-full border rounded-lg p-2 text-sm font-bold bg-white" value={selectedMeal} onChange={e => setSelectedMeal(e.target.value as MealType)}>
            {Object.entries(MEAL_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        
        <select className="w-full border rounded-lg p-2 text-sm bg-white" value={selectedFoodId} onChange={e => setSelectedFoodId(e.target.value)}>
            <option value="">-- 選擇食材 --</option>
            {foods.map(f => <option key={f.id} value={f.id}>{CATEGORY_LABELS[f.category]} - {f.name}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-2">
            <div className="relative">
                <label className="text-[10px] text-gray-400 ml-1">規劃份量</label>
                <input type="text" className="w-full border rounded-lg p-2 text-sm pr-10 focus:ring-2 focus:ring-emerald-500 outline-none" value={portionDesc} onChange={e => setPortionDesc(e.target.value)} />
                <span className="absolute right-3 top-7 text-[10px] text-gray-400">份</span>
            </div>
            <div>
                <label className="text-[10px] text-gray-400 ml-1">烹調</label>
                <select className="w-full border rounded-lg p-2 text-sm bg-white" value={selectedMethod} onChange={e => setSelectedMethod(e.target.value as CookingMethod)}>
                {Object.entries(COOKING_MODIFIERS).map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}
                </select>
            </div>
        </div>

        <button onClick={handleAddFood} disabled={!selectedFoodId} className="w-full bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-emerald-700 shadow-sm transition-all active:scale-95 disabled:opacity-50 mt-2">
            加入清單
        </button>
    </div>
  );
};

export default AddFoodForm;
