import React, { useState } from 'react';
import { FoodItem } from '../../types';
import { CATEGORY_LABELS } from '../../constants';
import { MEAT_FAT_LABELS, DAIRY_FAT_LABELS } from '../../constants/exchangeConstants';

interface FoodTableProps {
    foods: FoodItem[];
    onDeleteFood: (id: string) => void;
}

const FoodTable: React.FC<FoodTableProps> = ({ foods, onDeleteFood }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredFoods = foods.filter(f => f.name.includes(searchTerm));

    // 取得脂肪等級標籤
    const getFatLevelLabel = (food: FoodItem): string | null => {
        if (!food.fatLevel) return null;
        if (food.category === 'dairy') {
            return DAIRY_FAT_LABELS[food.fatLevel as keyof typeof DAIRY_FAT_LABELS];
        }
        if (food.category === 'meat') {
            return MEAT_FAT_LABELS[food.fatLevel as keyof typeof MEAT_FAT_LABELS];
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex gap-4">
                <div className="relative flex-1">
                    <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="搜尋食材..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="p-4">名稱</th>
                            <th className="p-4">六大類</th>
                            <th className="p-4">每份份量</th>
                            <th className="p-4">蛋白質</th>
                            <th className="p-4">脂肪</th>
                            <th className="p-4">醣類</th>
                            <th className="p-4">熱量</th>
                            <th className="p-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredFoods.map(food => {
                            const fatLabel = getFatLevelLabel(food);
                            const isExpanded = expandedId === food.id;
                            return (
                                <React.Fragment key={food.id}>
                                    <tr
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => setExpandedId(isExpanded ? null : food.id)}
                                    >
                                        <td className="p-4 font-medium text-gray-800">
                                            <div className="flex items-center gap-2">
                                                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-gray-300 text-[10px]`}></i>
                                                {food.name}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full uppercase">
                                                    {CATEGORY_LABELS[food.category]}
                                                </span>
                                                {fatLabel && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] rounded-full">
                                                        {fatLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{food.portionSize}{food.portionUnit}</td>
                                        <td className="p-4 text-emerald-600 font-medium">{food.proteinPerPortion}g</td>
                                        <td className="p-4 text-blue-600 font-medium">{food.fatPerPortion}g</td>
                                        <td className="p-4 text-amber-600 font-medium">{food.carbsPerPortion}g</td>
                                        <td className="p-4 text-orange-600 font-bold">{food.caloriesPerPortion}<small>kcal</small></td>
                                        <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => onDeleteFood(food.id)}
                                                className="text-red-300 hover:text-red-500 transition"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={8} className="p-4">
                                                <div className="grid grid-cols-4 gap-4 text-[11px]">
                                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                        <div className="text-gray-400 mb-1">每份重量</div>
                                                        <div className="font-bold text-gray-700">{food.portionSize} {food.portionUnit}</div>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-emerald-100">
                                                        <div className="text-gray-400 mb-1">蛋白質</div>
                                                        <div className="font-bold text-emerald-600">{food.proteinPerPortion} g/份</div>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                                                        <div className="text-gray-400 mb-1">脂肪</div>
                                                        <div className="font-bold text-blue-600">{food.fatPerPortion} g/份</div>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-amber-100">
                                                        <div className="text-gray-400 mb-1">醣類</div>
                                                        <div className="font-bold text-amber-600">{food.carbsPerPortion} g/份</div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100 flex justify-between items-center">
                                                    <span className="text-[11px] text-gray-500">每份總熱量</span>
                                                    <span className="font-black text-orange-600 text-lg">{food.caloriesPerPortion} kcal</span>
                                                </div>
                                                {food.fatLevel && (
                                                    <div className="mt-2 text-[10px] text-gray-400">
                                                        脂肪等級: <span className="text-amber-600 font-medium">{fatLabel}</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FoodTable;
