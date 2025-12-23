import React, { useState } from 'react';
import { FoodItem, FoodCategory } from '../../types';
import { CATEGORY_LABELS } from '../../constants';
import { useAINutrition } from '../../hooks/useAINutrition';

interface FoodCreationFormProps {
    onAddFood: (food: FoodItem) => void;
    onClose: () => void;
}

const FoodCreationForm: React.FC<FoodCreationFormProps> = ({ onAddFood, onClose }) => {
    const { isLoadingAI, fetchNutritionData } = useAINutrition();

    const [newFood, setNewFood] = useState<Partial<FoodItem>>({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        unit: '100g',
        category: 'other'
    });

    const handleAIAutoFill = async () => {
        if (!newFood.name) return;
        const data = await fetchNutritionData(newFood.name);
        if (data) {
            setNewFood({ ...newFood, ...data });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFood.name && newFood.unit) {
            onAddFood({
                id: Date.now().toString(),
                name: newFood.name,
                calories: Number(newFood.calories),
                protein: Number(newFood.protein),
                carbs: Number(newFood.carbs),
                fat: Number(newFood.fat),
                unit: newFood.unit,
                category: newFood.category as FoodCategory || 'other'
            });
            setNewFood({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, unit: '100g', category: 'other' });
            onClose();
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
            <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">新增基礎食材資料</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2 flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">食材名稱</label>
                            <input
                                type="text"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={newFood.name}
                                onChange={e => setNewFood({ ...newFood, name: e.target.value })}
                                placeholder="請輸入原形食材名稱"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleAIAutoFill}
                                disabled={isLoadingAI || !newFood.name}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                            >
                                {isLoadingAI ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>} AI 估算
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">份量單位</label>
                        <input
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={newFood.unit}
                            onChange={e => setNewFood({ ...newFood, unit: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">六大類分類</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={newFood.category}
                            onChange={e => setNewFood({ ...newFood, category: e.target.value as any })}
                        >
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:col-span-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">熱量 (kcal)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newFood.calories}
                                onChange={e => setNewFood({ ...newFood, calories: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">蛋白質 (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newFood.protein}
                                onChange={e => setNewFood({ ...newFood, protein: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">碳水 (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newFood.carbs}
                                onChange={e => setNewFood({ ...newFood, carbs: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">脂肪 (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newFood.fat}
                                onChange={e => setNewFood({ ...newFood, fat: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium"
                >
                    存入資料庫
                </button>
            </form>
        </div>
    );
};

export default FoodCreationForm;
