
import React, { useState, useEffect } from 'react';
import FoodDatabase from './components/FoodDatabase';
import MenuBuilder from './components/MenuBuilder';
import TemplateManager from './components/TemplateManager';
import { FoodItem, View, MenuPlan, MealTemplate } from './types';
import { INITIAL_FOODS, MEAL_TEMPLATES } from './constants';
import ConfirmModal from './components/ConfirmModal';

// 食物資料庫版本號 - 每次結構變更時遞增以強制更新 localStorage
const FOOD_DB_VERSION = '2.0.0'; // 2.0.0: 改用 per-portion 格式 + fatLevel
const TEMPLATE_VERSION = '2.0.0'; // 2.0.0: 配合新 foodId 格式

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('builder');

  const [foods, setFoods] = useState<FoodItem[]>(() => {
    const savedVersion = localStorage.getItem('nutriplan_foods_version');
    const saved = localStorage.getItem('nutriplan_foods');

    // 如果版本不符，使用新的 INITIAL_FOODS 並清除舊資料
    if (savedVersion !== FOOD_DB_VERSION) {
      localStorage.setItem('nutriplan_foods_version', FOOD_DB_VERSION);
      localStorage.removeItem('nutriplan_foods');
      console.log(`[NutriPlan] 食物資料庫升級至 v${FOOD_DB_VERSION}`);
      return INITIAL_FOODS;
    }

    return saved ? JSON.parse(saved) : INITIAL_FOODS;
  });

  const [templates, setTemplates] = useState<MealTemplate[]>(() => {
    const savedVersion = localStorage.getItem('nutriplan_templates_version');
    const saved = localStorage.getItem('nutriplan_templates');

    // 如果版本不符，使用新的 MEAL_TEMPLATES 並清除舊資料
    if (savedVersion !== TEMPLATE_VERSION) {
      localStorage.setItem('nutriplan_templates_version', TEMPLATE_VERSION);
      localStorage.removeItem('nutriplan_templates');
      console.log(`[NutriPlan] 快速腳本升級至 v${TEMPLATE_VERSION}`);
      return MEAL_TEMPLATES;
    }

    return saved ? JSON.parse(saved) : MEAL_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem('nutriplan_foods', JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem('nutriplan_templates', JSON.stringify(templates));
  }, [templates]);

  // Confirm modal states
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({ show: false, title: '', message: '', onConfirm: () => { } });

  const handleAddFood = (food: FoodItem) => {
    setFoods([...foods, food]);
  };

  const handleDeleteFood = (id: string) => {
    setConfirmModal({
      show: true,
      title: '刪除食物',
      message: '確定要刪除此食物資料嗎？',
      variant: 'danger',
      onConfirm: () => {
        setFoods(foods.filter(f => f.id !== id));
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleAddTemplate = (template: MealTemplate) => {
    setTemplates([...templates, template]);
  };

  const handleDeleteTemplate = (id: string) => {
    setConfirmModal({
      show: true,
      title: '刪除腳本',
      message: '確定要刪除此腳本嗎？',
      variant: 'danger',
      onConfirm: () => {
        setTemplates(templates.filter(t => t.id !== id));
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleUpdateTemplate = (id: string, updates: Partial<MealTemplate>) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleSaveMenu = (plan: MenuPlan) => {
    console.log("Plan Saved", plan);
    alert("功能開發中：計畫已暫存於記憶體");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <aside className="w-20 lg:w-64 bg-emerald-900 text-white flex flex-col items-center lg:items-start py-6 transition-all duration-300 z-10 no-print">
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-leaf text-xl text-white"></i>
          </div>
          <span className="text-xl font-bold hidden lg:block tracking-wide">NutriPlan</span>
        </div>

        <nav className="w-full flex-1 space-y-2 px-2">
          <button
            onClick={() => setCurrentView('builder')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${currentView === 'builder' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-200 hover:bg-emerald-800/50'}`}
          >
            <i className="fas fa-utensils w-6 text-center"></i>
            <span className="hidden lg:block font-medium">菜單規劃</span>
          </button>

          <button
            onClick={() => setCurrentView('database')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${currentView === 'database' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-200 hover:bg-emerald-800/50'}`}
          >
            <i className="fas fa-database w-6 text-center"></i>
            <span className="hidden lg:block font-medium">食物資料庫</span>
          </button>

          <button
            onClick={() => setCurrentView('templates')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${currentView === 'templates' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-200 hover:bg-emerald-800/50'}`}
          >
            <i className="fas fa-file-alt w-6 text-center"></i>
            <span className="hidden lg:block font-medium">腳本管理</span>
          </button>

          {/* Management Section */}
          <div className="mt-2 px-2 hidden lg:block">
            <div className="bg-emerald-800/30 rounded-lg p-3 text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-200">
                <span className="opacity-70">食材總數</span>
                <span className="font-bold">{foods.length}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-200">
                <span className="opacity-70">腳本數量</span>
                <span className="font-bold">{templates.length}</span>
              </div>
              <button
                onClick={() => {
                  setConfirmModal({
                    show: true,
                    title: '清除所有資料',
                    message: '確定要清除所有本地資料嗎？此操作無法復原。',
                    variant: 'danger',
                    onConfirm: () => {
                      localStorage.clear();
                      window.location.reload();
                    }
                  });
                }}
                className="w-full mt-2 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-200 rounded text-[10px] transition flex items-center justify-center gap-1"
              >
                <i className="fas fa-trash-alt"></i>
                <span>清除資料</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="px-4 py-4 w-full">
          <div className="bg-emerald-800/50 rounded-xl p-4 hidden lg:block text-xs">
            <p className="text-emerald-300 mb-1 font-bold">循環菜單系統已啟動</p>
            <p className="opacity-50">支援多日自動試算</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden">
        {currentView === 'builder' && (
          <MenuBuilder
            foods={foods}
            templates={templates}
            onAddTemplate={handleAddTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onSaveMenu={handleSaveMenu}
          />
        )}

        {currentView === 'database' && (
          <div className="h-full overflow-y-auto">
            <FoodDatabase
              foods={foods}
              onAddFood={handleAddFood}
              onDeleteFood={handleDeleteFood}
            />
          </div>
        )}

        {currentView === 'templates' && (
          <div className="h-full overflow-y-auto">
            <TemplateManager
              templates={templates}
              foods={foods}
              onDeleteTemplate={handleDeleteTemplate}
              onUpdateTemplate={handleUpdateTemplate}
            />
          </div>
        )}
      </main>

      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default App;
