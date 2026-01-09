
import React, { useState } from 'react';
import { FoodItem, MealType, CookingMethod, MenuEntry } from '../../types';
import { CATEGORY_LABELS, MEAL_LABELS, COOKING_MODIFIERS } from '../../constants';

interface AddFoodFormProps {
  foods: FoodItem[];
  activeDayIndex: number;
  onAdd: (meal: MealType, foodId: string, method: CookingMethod, portionDesc: string) => void;
  onAddCustom?: (meal: MealType, customEntry: Partial<MenuEntry>) => void;
}

const AddFoodForm: React.FC<AddFoodFormProps> = ({ foods, activeDayIndex, onAdd, onAddCustom }) => {
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [selectedMethod, setSelectedMethod] = useState<CookingMethod>('boiled');
  const [portionDesc, setPortionDesc] = useState<string>('1');

  // 自訂餐點模式
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const handleAddFood = () => {
    if (!selectedFoodId) return;
    onAdd(selectedMeal, selectedFoodId, selectedMethod, portionDesc);
    setSelectedFoodId('');
    setPortionDesc('1');
  };

  const handleAddCustomFood = () => {
    if (!customName.trim() || !onAddCustom) return;

    const calories = parseFloat(customCalories) || 0;
    const protein = parseFloat(customProtein) || 0;
    const carbs = parseFloat(customCarbs) || 0;
    const fat = parseFloat(customFat) || 0;

    onAddCustom(selectedMeal, {
      isCustom: true,
      customName: customName.trim(),
      amount: parseFloat(portionDesc) || 1,
      cookingMethod: 'original',
      customNutrition: { calories, protein, carbs, fat }
    });

    // 重置表單
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setPortionDesc('1');
  };

  return (
    <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-500">Day {activeDayIndex + 1}</span>
        {/* 模式切換 */}
        <button
          onClick={() => setIsCustomMode(!isCustomMode)}
          className={`text-xs font-bold px-2 py-1 rounded-lg transition-all ${isCustomMode
              ? 'bg-purple-100 text-purple-600'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
        >
          <i className={`fas ${isCustomMode ? 'fa-database' : 'fa-edit'} mr-1`}></i>
          {isCustomMode ? '從資料庫選' : '自訂餐點'}
        </button>
      </div>

      {/* 餐次選擇 */}
      <select className="w-full border rounded-lg p-2 text-sm font-bold bg-white" value={selectedMeal} onChange={e => setSelectedMeal(e.target.value as MealType)}>
        {Object.entries(MEAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>

      {isCustomMode ? (
        /* 自訂餐點模式 */
        <>
          <input
            type="text"
            placeholder="餐點名稱"
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 ml-1">熱量 (kcal)</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                value={customCalories}
                onChange={e => setCustomCalories(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 ml-1">蛋白質 (g)</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                value={customProtein}
                onChange={e => setCustomProtein(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 ml-1">碳水化合物 (g)</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                value={customCarbs}
                onChange={e => setCustomCarbs(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 ml-1">脂肪 (g)</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                value={customFat}
                onChange={e => setCustomFat(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] text-gray-400 ml-1">份量</label>
            <input type="text" className="w-full border rounded-lg p-2 text-sm pr-10 focus:ring-2 focus:ring-purple-500 outline-none" value={portionDesc} onChange={e => setPortionDesc(e.target.value)} />
            <span className="absolute right-3 top-7 text-[10px] text-gray-400">份</span>
          </div>

          <button
            onClick={handleAddCustomFood}
            disabled={!customName.trim()}
            className="w-full bg-purple-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-purple-700 shadow-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            <i className="fas fa-plus mr-2"></i>
            加入自訂餐點
          </button>
        </>
      ) : (
        /* 資料庫選擇模式 */
        <>
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
                {Object.entries(COOKING_MODIFIERS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleAddFood} disabled={!selectedFoodId} className="w-full bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-emerald-700 shadow-sm transition-all active:scale-95 disabled:opacity-50 mt-2">
            加入清單
          </button>
        </>
      )}
    </div>
  );
};

export default AddFoodForm;
