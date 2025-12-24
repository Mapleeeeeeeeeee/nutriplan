import React from 'react';
import { MenuEntry, FoodItem, MealType } from '../../types';
import { CATEGORY_ICONS, CATEGORY_COLORS, COOKING_MODIFIERS } from '../../constants';

interface MenuEntryCardProps {
    entry: MenuEntry;
    food: FoodItem;
    mealKey: MealType;
    onUpdateField: (meal: MealType, entryId: string, field: keyof MenuEntry, value: string) => void;
    onRemove: (meal: MealType, entryId: string) => void;
    onOpenSubPanel: (meal: MealType, entry: MenuEntry) => void;
}

const MenuEntryCard: React.FC<MenuEntryCardProps> = ({
    entry,
    food,
    mealKey,
    onUpdateField,
    onRemove,
    onOpenSubPanel
}) => {
    return (
        <div className="flex items-center bg-white border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/10 rounded-xl p-2.5 shadow-sm hover:shadow-md transition group overflow-hidden relative min-h-[55px]">
            <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: CATEGORY_COLORS[food.category] || '#ccc' }}
            />

            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mr-3 shrink-0 text-xs shadow-inner">
                <i
                    className={`fas ${CATEGORY_ICONS[food.category]} text-xs`}
                    style={{ color: CATEGORY_COLORS[food.category] }}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <input
                        className="font-black text-slate-800 text-sm bg-white/50 border border-transparent hover:border-emerald-200 focus:border-emerald-500 focus:bg-white outline-none w-full truncate px-2 py-0.5 rounded-lg transition"
                        value={entry.customName || food.name}
                        onChange={(e) => onUpdateField(mealKey, entry.id, 'customName', e.target.value)}
                        placeholder={food.name}
                    />
                    <input
                        className="text-[10px] text-emerald-700 font-black bg-emerald-100/50 hover:bg-emerald-100 border border-transparent hover:border-emerald-300 px-2 py-0.5 rounded-lg shrink-0 w-24 text-center outline-none transition"
                        value={entry.portionDescription || ''}
                        onChange={(e) => onUpdateField(mealKey, entry.id, 'portionDescription', e.target.value)}
                        placeholder="份數描述"
                    />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 px-2 mt-1">
                    <span className="italic opacity-60">{COOKING_MODIFIERS[entry.cookingMethod].name}</span>
                    <span className="font-medium text-emerald-600/60">
                        {((food.caloriesPerPortion + COOKING_MODIFIERS[entry.cookingMethod].cal) * entry.amount).toFixed(0)} kcal
                    </span>
                </div>
            </div>

            <div className="flex gap-1 no-print opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                <button
                    onClick={() => onOpenSubPanel(mealKey, entry)}
                    className="w-7 h-7 flex items-center justify-center text-blue-400 hover:bg-blue-50 rounded-lg transition"
                >
                    <i className="fas fa-exchange-alt text-xs" />
                </button>
                <button
                    onClick={() => onRemove(mealKey, entry.id)}
                    className="w-7 h-7 flex items-center justify-center text-red-300 hover:bg-red-50 rounded-lg transition"
                >
                    <i className="fas fa-trash text-xs" />
                </button>
            </div>
        </div>
    );
};

export default MenuEntryCard;
