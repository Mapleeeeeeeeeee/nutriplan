import React, { useState } from 'react';
import { MealTemplate, FoodItem } from '../types';
import { CATEGORY_LABELS, MEAL_LABELS } from '../constants';
import TemplateEditModal from './TemplateEditModal';

interface TemplateManagerProps {
    templates: MealTemplate[];
    foods: FoodItem[];
    onDeleteTemplate: (id: string) => void;
    onUpdateTemplate: (id: string, updates: Partial<MealTemplate>) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
    templates,
    foods,
    onDeleteTemplate,
    onUpdateTemplate
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<MealTemplate | null>(null);

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFood = (id: string) => foods.find(f => f.id === id);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">腳本管理</h2>
                    <p className="text-sm text-gray-500 mt-1">管理所有已儲存的菜單腳本模板</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 px-4 py-2 rounded-lg">
                        <span className="text-sm text-gray-600">總腳本數：</span>
                        <span className="text-lg font-bold text-emerald-600 ml-2">{templates.length}</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-3.5 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="搜尋腳本名稱..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="text-center py-20">
                    <i className="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 text-lg">
                        {searchTerm ? '找不到符合的腳本' : '尚未建立任何腳本'}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                        在菜單規劃頁面中點擊「存為腳本」來建立新腳本
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-200 overflow-hidden group"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{template.name}</h3>
                                        <div className="flex items-center gap-2 text-xs opacity-90">
                                            <i className="fas fa-utensils"></i>
                                            <span>{template.items.length} 項食材</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                                    >
                                        <i className={`fas fa-chevron-${selectedTemplate === template.id ? 'up' : 'down'}`}></i>
                                    </button>
                                </div>
                            </div>

                            {/* Macro Ratios */}
                            <div className="p-4 bg-gray-50 border-b">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-gray-600">蛋白質</span>
                                        <span className="font-bold text-emerald-700">{template.macroRatio.protein}%</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-gray-600">碳水</span>
                                        <span className="font-bold text-blue-700">{template.macroRatio.carbs}%</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <span className="text-gray-600">脂肪</span>
                                        <span className="font-bold text-amber-700">{template.macroRatio.fat}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {selectedTemplate === template.id && (
                                <div className="p-4 border-b max-h-64 overflow-y-auto">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">食材清單</h4>
                                    <div className="space-y-1">
                                        {template.items.map((item, idx) => {
                                            const food = getFood(item.foodId);
                                            return (
                                                <div key={idx} className="flex items-center gap-2 text-xs py-1">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] min-w-[50px] text-center">
                                                        {MEAL_LABELS[item.meal as keyof typeof MEAL_LABELS] || item.meal}
                                                    </span>
                                                    <span className="text-gray-800 flex-1 truncate">
                                                        {item.customName || food?.name || '未知食材'}
                                                    </span>
                                                    <span className="text-gray-500">{item.portionDesc}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {template.note && (
                                        <div className="mt-3 pt-3 border-t">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">備註</h4>
                                            <p className="text-xs text-gray-600 leading-relaxed">{template.note}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="p-3 flex gap-2">
                                <button
                                    onClick={() => setEditingTemplate(template)}
                                    className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-edit text-xs"></i>
                                    編輯
                                </button>
                                <button
                                    onClick={() => onDeleteTemplate(template.id)}
                                    className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-trash-alt text-xs"></i>
                                    刪除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            <TemplateEditModal
                template={editingTemplate}
                show={!!editingTemplate}
                onClose={() => setEditingTemplate(null)}
                onSave={onUpdateTemplate}
            />
            {/* Info Card */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <i className="fas fa-info-circle text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 mb-1">關於腳本</h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            腳本是已儲存的菜單模板，包含完整的餐點配置和營養比例設定。
                            您可以在「菜單規劃」頁面快速載入腳本，節省重複規劃的時間。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateManager;
