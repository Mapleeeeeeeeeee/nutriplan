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
                            <th className="p-4">每份熱量</th>
                            <th className="p-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredFoods.map(food => {
                            const fatLabel = getFatLevelLabel(food);
                            return (
                                <tr key={food.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800">{food.name}</td>
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
                                    <td className="p-4 text-emerald-600 font-bold">{food.caloriesPerPortion} <small>kcal</small></td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => onDeleteFood(food.id)}
                                            className="text-red-300 hover:text-red-500 transition"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FoodTable;
