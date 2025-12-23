import React from 'react';
import { MenuPlan, MealType, MenuEntry, FoodItem } from '../types';
import { MEAL_LABELS } from '../constants';
import MenuEntryCard from './DailyMenu/MenuEntryCard';

interface DailyMenuProps {
  currentPlan: MenuPlan;
  activeDayIndex: number;
  foods: FoodItem[];
  onUpdateEntryField: (meal: MealType, entryId: string, field: keyof MenuEntry, value: string) => void;
  onRemoveEntry: (meal: MealType, entryId: string) => void;
  onOpenSubPanel: (meal: MealType, entry: MenuEntry) => void;
}

const DailyMenu: React.FC<DailyMenuProps> = ({
  currentPlan,
  activeDayIndex,
  foods,
  onUpdateEntryField,
  onRemoveEntry,
  onOpenSubPanel
}) => {
  const getFood = (id: string) => foods.find(f => f.id === id);
  const currentDay = currentPlan.days[activeDayIndex];

  return (
    <div className="md:col-span-2 space-y-6">
      {(Object.entries(MEAL_LABELS) as [MealType, string][]).map(([mealKey, label]) => (
        <div key={mealKey} className="group/meal">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <h4 className="font-black text-slate-700 text-xs tracking-[0.2em]">{label}</h4>
            </div>
          </div>

          <div className="space-y-1">
            {currentDay[mealKey].length === 0 ? (
              <div className="border border-dashed border-gray-100 rounded-xl p-3 text-center no-print">
                <p className="text-[10px] text-gray-300">目前尚無安排餐點</p>
              </div>
            ) : (
              currentDay[mealKey].map(entry => {
                const food = getFood(entry.foodId);
                if (!food) return null;
                return (
                  <MenuEntryCard
                    key={entry.id}
                    entry={entry}
                    food={food}
                    mealKey={mealKey}
                    onUpdateField={onUpdateEntryField}
                    onRemove={onRemoveEntry}
                    onOpenSubPanel={onOpenSubPanel}
                  />
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyMenu;
