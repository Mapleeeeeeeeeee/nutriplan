import React from 'react';
import { MealChoiceOption, MenuEntry, FoodItem, MealType } from '../../types';
import { CATEGORY_ICONS, CATEGORY_COLORS, COOKING_MODIFIERS } from '../../constants';

interface ChoiceOptionCardProps {
    option: MealChoiceOption;
    optionIndex: number;
    mealKey: MealType;
    foods: FoodItem[];
    onUpdateLabel: (optionId: string, label: string) => void;
    onRemoveOption: (optionId: string) => void;
    onRemoveEntry: (optionId: string, entryId: string) => void;
    onUpdateEntryField: (optionId: string, entryId: string, field: keyof MenuEntry, value: string) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const OPTION_COLORS = [
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-500' },
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-500' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-500' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-500' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-500' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', badge: 'bg-indigo-500' },
];

const ChoiceOptionCard: React.FC<ChoiceOptionCardProps> = ({
    option,
    optionIndex,
    mealKey,
    foods,
    onUpdateLabel,
    onRemoveOption,
    onRemoveEntry,
    onUpdateEntryField
}) => {
    const colors = OPTION_COLORS[optionIndex] || OPTION_COLORS[0];
    const letter = OPTION_LETTERS[optionIndex] || '?';

    const getFood = (id: string) => foods.find(f => f.id === id);

    // 計算該選項的總熱量
    const totalCalories = option.entries.reduce((sum, entry) => {
        const food = getFood(entry.foodId);
        if (!food) return sum;
        const modifier = COOKING_MODIFIERS[entry.cookingMethod];
        return sum + (food.caloriesPerPortion + modifier.cal) * entry.amount;
    }, 0);

    return (
        <div className={`rounded-2xl border-2 ${colors.border} ${colors.bg}/30 overflow-hidden`}>
            {/* 選項標題列 */}
            <div className={`flex items-center gap-3 px-4 py-3 ${colors.bg}`}>
                <div className={`w-8 h-8 rounded-xl ${colors.badge} text-white flex items-center justify-center font-black text-lg shadow-sm`}>
                    {letter}
                </div>
                <input
                    type="text"
                    value={option.label}
                    onChange={(e) => onUpdateLabel(option.id, e.target.value)}
                    placeholder={`選項 ${letter} 的標籤...`}
                    className={`flex-1 bg-white/60 ${colors.text} font-bold px-3 py-1.5 rounded-lg border border-transparent focus:border-white focus:bg-white outline-none transition text-sm`}
                />
                <div className={`text-xs font-bold ${colors.text} bg-white/60 px-2 py-1 rounded-lg`}>
                    ~{totalCalories.toFixed(0)} kcal
                </div>
                <button
                    onClick={() => onRemoveOption(option.id)}
                    className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-100 rounded-lg transition"
                    title="刪除此選項"
                >
                    <i className="fas fa-trash text-xs"></i>
                </button>
            </div>

            {/* 食物列表 */}
            <div className="p-3 space-y-2">
                {option.entries.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                        <i className="fas fa-utensils text-2xl mb-2 opacity-30"></i>
                        <p className="text-xs">從側邊欄添加食物到此選項</p>
                    </div>
                ) : (
                    option.entries.map((entry) => {
                        const food = getFood(entry.foodId);
                        if (!food) return null;

                        return (
                            <div
                                key={entry.id}
                                className="flex items-center bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-2 shadow-sm group"
                            >
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                                    style={{ backgroundColor: CATEGORY_COLORS[food.category] || '#ccc' }}
                                />
                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center mr-2">
                                    <i
                                        className={`fas ${CATEGORY_ICONS[food.category]} text-xs`}
                                        style={{ color: CATEGORY_COLORS[food.category] }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <input
                                        className="font-bold text-slate-700 text-sm bg-transparent border-0 focus:outline-none w-full truncate"
                                        value={entry.customName || food.name}
                                        onChange={(e) => onUpdateEntryField(option.id, entry.id, 'customName', e.target.value)}
                                        placeholder={food.name}
                                    />
                                </div>
                                <input
                                    className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded w-16 text-center outline-none"
                                    value={entry.portionDescription || ''}
                                    onChange={(e) => onUpdateEntryField(option.id, entry.id, 'portionDescription', e.target.value)}
                                    placeholder="份數"
                                />
                                <button
                                    onClick={() => onRemoveEntry(option.id, entry.id)}
                                    className="w-6 h-6 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg ml-1 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <i className="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChoiceOptionCard;
