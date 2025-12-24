import React from 'react';
import { MealChoice, MealChoiceOption, MenuEntry, FoodItem, MealType } from '../../types';
import ChoiceOptionCard from './ChoiceOptionCard';

interface MealChoiceEditorProps {
    mealKey: MealType;
    mealLabel: string;
    choice: MealChoice;
    foods: FoodItem[];
    onAddOption: () => void;
    onUpdateOption: (optionId: string, updates: Partial<MealChoiceOption>) => void;
    onRemoveOption: (optionId: string) => void;
    onRemoveEntry: (optionId: string, entryId: string) => void;
    onUpdateEntryField: (optionId: string, entryId: string, field: keyof MenuEntry, value: string) => void;
    activeOptionId: string | null;
    onSelectOption: (optionId: string) => void;
}

const MealChoiceEditor: React.FC<MealChoiceEditorProps> = ({
    mealKey,
    mealLabel,
    choice,
    foods,
    onAddOption,
    onUpdateOption,
    onRemoveOption,
    onRemoveEntry,
    onUpdateEntryField,
    activeOptionId,
    onSelectOption
}) => {
    const handleUpdateLabel = (optionId: string, label: string) => {
        onUpdateOption(optionId, { label });
    };

    return (
        <div className="space-y-3">
            {/* 選項說明 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded-lg">
                        <i className="fas fa-list-check mr-1"></i>
                        請選一組
                    </span>
                    <span className="text-[10px] text-gray-400">
                        點擊選項以設為新增目標
                    </span>
                </div>
                <button
                    onClick={onAddOption}
                    disabled={choice.options.length >= 6}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i className="fas fa-plus mr-1"></i>
                    新增選項
                </button>
            </div>

            {/* 選項列表 */}
            <div className="space-y-3">
                {choice.options.map((option, idx) => (
                    <div
                        key={option.id}
                        onClick={() => onSelectOption(option.id)}
                        className={`cursor-pointer transition-all ${activeOptionId === option.id
                                ? 'ring-2 ring-purple-400 ring-offset-2'
                                : 'hover:ring-1 hover:ring-purple-200'
                            }`}
                    >
                        <ChoiceOptionCard
                            option={option}
                            optionIndex={idx}
                            mealKey={mealKey}
                            foods={foods}
                            onUpdateLabel={handleUpdateLabel}
                            onRemoveOption={onRemoveOption}
                            onRemoveEntry={onRemoveEntry}
                            onUpdateEntryField={onUpdateEntryField}
                        />
                    </div>
                ))}
            </div>

            {/* 空狀態 */}
            {choice.options.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-2xl bg-purple-50/30">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-layer-group text-purple-500 text-xl"></i>
                    </div>
                    <p className="text-sm text-purple-600 font-bold mb-1">尚未新增選項</p>
                    <p className="text-xs text-purple-400">點擊上方「新增選項」開始建立 ABC 選擇</p>
                </div>
            )}

            {/* 提示 */}
            {choice.options.length > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <i className="fas fa-lightbulb text-amber-500 mt-0.5"></i>
                    <div className="text-xs text-amber-700">
                        <span className="font-bold">提示：</span>
                        建議各選項熱量相近，讓客戶無論選哪個都能達成營養目標。
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealChoiceEditor;
