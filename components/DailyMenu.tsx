import React from 'react';
import { MenuPlan, MealType, MenuEntry, FoodItem, MealChoice, MealChoiceOption } from '../types';
import { MEAL_LABELS } from '../constants';
import MenuEntryCard from './DailyMenu/MenuEntryCard';
import { MealChoiceToggle, MealChoiceEditor } from './MealChoice';

interface DailyMenuProps {
  currentPlan: MenuPlan;
  activeDayIndex: number;
  foods: FoodItem[];
  // 單一模式 handlers
  onUpdateEntryField: (meal: MealType, entryId: string, field: keyof MenuEntry, value: string) => void;
  onRemoveEntry: (meal: MealType, entryId: string) => void;
  onOpenSubPanel: (meal: MealType, entry: MenuEntry) => void;
  // 選擇模式 handlers
  onToggleChoiceMode: (meal: MealType) => void;
  onAddChoiceOption: (meal: MealType) => void;
  onUpdateChoiceOption: (meal: MealType, optionId: string, updates: Partial<MealChoiceOption>) => void;
  onRemoveChoiceOption: (meal: MealType, optionId: string) => void;
  onRemoveChoiceEntry: (meal: MealType, optionId: string, entryId: string) => void;
  onUpdateChoiceEntryField: (meal: MealType, optionId: string, entryId: string, field: keyof MenuEntry, value: string) => void;
  // 當前選中的選項（用於添加食物）
  activeChoiceOption: { meal: MealType; optionId: string } | null;
  onSelectChoiceOption: (meal: MealType, optionId: string) => void;
}

const DailyMenu: React.FC<DailyMenuProps> = ({
  currentPlan,
  activeDayIndex,
  foods,
  onUpdateEntryField,
  onRemoveEntry,
  onOpenSubPanel,
  onToggleChoiceMode,
  onAddChoiceOption,
  onUpdateChoiceOption,
  onRemoveChoiceOption,
  onRemoveChoiceEntry,
  onUpdateChoiceEntryField,
  activeChoiceOption,
  onSelectChoiceOption
}) => {
  const getFood = (id: string) => foods.find(f => f.id === id);
  const currentDay = currentPlan.days[activeDayIndex];

  return (
    <div className="md:col-span-2 space-y-6">
      {(Object.entries(MEAL_LABELS) as [MealType, string][]).map(([mealKey, label]) => {
        const mealData = currentDay[mealKey];
        const isChoiceMode = mealData.choice?.enabled || false;
        const entries = mealData.entries || [];
        const choice = mealData.choice;

        return (
          <div key={mealKey} className="group/meal">
            {/* 餐別標題列 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isChoiceMode ? 'bg-purple-500' : 'bg-emerald-500'} rounded-full`}></div>
                <h4 className="font-black text-slate-700 text-xs tracking-[0.2em]">{label}</h4>
              </div>
              <div className="no-print">
                <MealChoiceToggle
                  enabled={isChoiceMode}
                  onToggle={() => onToggleChoiceMode(mealKey)}
                />
              </div>
            </div>

            {/* 內容區域 */}
            <div className="space-y-1">
              {isChoiceMode && choice ? (
                /* ABC 選擇模式 */
                <MealChoiceEditor
                  mealKey={mealKey}
                  mealLabel={label}
                  choice={choice}
                  foods={foods}
                  onAddOption={() => onAddChoiceOption(mealKey)}
                  onUpdateOption={(optionId, updates) => onUpdateChoiceOption(mealKey, optionId, updates)}
                  onRemoveOption={(optionId) => onRemoveChoiceOption(mealKey, optionId)}
                  onRemoveEntry={(optionId, entryId) => onRemoveChoiceEntry(mealKey, optionId, entryId)}
                  onUpdateEntryField={(optionId, entryId, field, value) =>
                    onUpdateChoiceEntryField(mealKey, optionId, entryId, field, value)
                  }
                  activeOptionId={activeChoiceOption?.meal === mealKey ? activeChoiceOption.optionId : null}
                  onSelectOption={(optionId) => onSelectChoiceOption(mealKey, optionId)}
                />
              ) : (
                /* 單一模式 */
                entries.length === 0 ? (
                  <div className="border border-dashed border-gray-100 rounded-xl p-3 text-center no-print">
                    <p className="text-[10px] text-gray-300">目前尚無安排餐點</p>
                  </div>
                ) : (
                  entries.map(entry => {
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
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DailyMenu;
