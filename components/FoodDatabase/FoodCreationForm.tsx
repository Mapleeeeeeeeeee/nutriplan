import React, { useState } from 'react';
import { FoodItem, FoodCategory } from '../../types';
import { CATEGORY_LABELS } from '../../constants';
import { FatLevel, getExchangeValue } from '../../constants/exchangeConstants';
import { useAINutrition } from '../../hooks/useAINutrition';

interface FoodCreationFormProps {
    onAddFood: (food: FoodItem) => void;
    onClose: () => void;
}

const DEFAULT_PORTION_SIZES: Record<FoodCategory, { size: number; unit: string }> = {
    dairy: { size: 240, unit: 'ml' },
    meat: { size: 35, unit: 'g' },
    staple: { size: 40, unit: 'g' },
    vegetable: { size: 100, unit: 'g' },
    fruit: { size: 100, unit: 'g' },
    fat: { size: 10, unit: 'g' },
    other: { size: 100, unit: 'g' }
};

const FoodCreationForm: React.FC<FoodCreationFormProps> = ({ onAddFood, onClose }) => {
    const { isLoadingAI, fetchNutritionData } = useAINutrition();

    const [newFood, setNewFood] = useState<{
        name: string;
        portionSize: number;
        portionUnit: string;
        caloriesPerPortion: number;
        proteinPerPortion: number;
        carbsPerPortion: number;
        fatPerPortion: number;
        category: FoodCategory;
        fatLevel?: FatLevel;
    }>({
        name: '',
        portionSize: 100,
        portionUnit: 'g',
        caloriesPerPortion: 0,
        proteinPerPortion: 0,
        carbsPerPortion: 0,
        fatPerPortion: 0,
        category: 'other',
        fatLevel: undefined
    });

    // 當類別變更時，自動填入標準代換值
    const handleCategoryChange = (category: FoodCategory) => {
        const defaultPortion = DEFAULT_PORTION_SIZES[category];
        const exchange = getExchangeValue(category, newFood.fatLevel);

        setNewFood(prev => ({
            ...prev,
            category,
            portionSize: defaultPortion.size,
            portionUnit: defaultPortion.unit,
            caloriesPerPortion: exchange.calories,
            proteinPerPortion: exchange.protein,
            carbsPerPortion: exchange.carbs,
            fatPerPortion: exchange.fat
        }));
    };

    // 當脂肪等級變更時，更新營養素
    const handleFatLevelChange = (fatLevel: FatLevel) => {
        const exchange = getExchangeValue(newFood.category, fatLevel);
        setNewFood(prev => ({
            ...prev,
            fatLevel,
            caloriesPerPortion: exchange.calories,
            proteinPerPortion: exchange.protein,
            carbsPerPortion: exchange.carbs,
            fatPerPortion: exchange.fat
        }));
    };

    const handleAIAutoFill = async () => {
        if (!newFood.name) return;
        const data = await fetchNutritionData(newFood.name);
        if (data) {
            setNewFood(prev => ({ ...prev, ...data }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFood.name && newFood.portionUnit) {
            onAddFood({
                id: Date.now().toString(),
                name: newFood.name,
                portionSize: newFood.portionSize,
                portionUnit: newFood.portionUnit,
                caloriesPerPortion: newFood.caloriesPerPortion,
                proteinPerPortion: newFood.proteinPerPortion,
                carbsPerPortion: newFood.carbsPerPortion,
                fatPerPortion: newFood.fatPerPortion,
                category: newFood.category,
                fatLevel: newFood.fatLevel
            });
            // Reset form
            setNewFood({
                name: '',
                portionSize: 100,
                portionUnit: 'g',
                caloriesPerPortion: 0,
                proteinPerPortion: 0,
                carbsPerPortion: 0,
                fatPerPortion: 0,
                category: 'other',
                fatLevel: undefined
            });
            onClose();
        }
    };

    const showFatLevel = newFood.category === 'meat' || newFood.category === 'dairy';

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
                        <label className="block text-sm font-medium text-gray-700 mb-1">六大類分類</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={newFood.category}
                            onChange={e => handleCategoryChange(e.target.value as FoodCategory)}
                        >
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {showFatLevel && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">脂肪等級</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                                value={newFood.fatLevel || ''}
                                onChange={e => handleFatLevelChange(e.target.value as FatLevel)}
                            >
                                {newFood.category === 'dairy' ? (
                                    <>
                                        <option value="full">全脂</option>
                                        <option value="low">低脂</option>
                                        <option value="skim">脫脂</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="low">低脂</option>
                                        <option value="medium">中脂</option>
                                        <option value="high">高脂</option>
                                    </>
                                )}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">每份份量</label>
                            <input
                                type="number"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={newFood.portionSize}
                                onChange={e => setNewFood({ ...newFood, portionSize: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="w-20">
                            <label className="block text-sm font-medium text-gray-700 mb-1">單位</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newFood.portionUnit}
                                onChange={e => setNewFood({ ...newFood, portionUnit: e.target.value })}
                            >
                                <option value="g">g</option>
                                <option value="ml">ml</option>
                                <option value="顆">顆</option>
                                <option value="片">片</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:col-span-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">每份熱量 (kcal)</label>
                            <input
                                type="number"
                                step="1"
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newFood.caloriesPerPortion}
                                onChange={e => setNewFood({ ...newFood, caloriesPerPortion: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">每份蛋白質 (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newFood.proteinPerPortion}
                                onChange={e => setNewFood({ ...newFood, proteinPerPortion: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">每份醣類 (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newFood.carbsPerPortion}
                                onChange={e => setNewFood({ ...newFood, carbsPerPortion: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">每份脂肪 (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={newFood.fatPerPortion}
                                onChange={e => setNewFood({ ...newFood, fatPerPortion: parseFloat(e.target.value) })}
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
