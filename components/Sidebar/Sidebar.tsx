
import React from 'react';
import { FoodItem, MealTemplate, MenuPlan, MealType, CookingMethod, FoodCategory, NutritionTotals, MenuEntry } from '../../types';
import TemplateSelector from './TemplateSelector';
import MacroConfigurator from './MacroConfigurator';
import PortionConfigurator from './PortionConfigurator';
import AddFoodForm from './AddFoodForm';

interface SidebarProps {
  foods: FoodItem[];
  templates: MealTemplate[];
  currentPlan: MenuPlan;
  activeDayIndex: number;
  dayStats: { totals: NutritionTotals; portions: Record<FoodCategory, number> };
  onUpdatePlan: (newPlan: MenuPlan) => void;
  onApplyTemplate: (tpl: MealTemplate) => void;
  onSaveCurrentTemplate: () => void;
  onDeleteTemplate: (id: string) => void;
  onAddFood: (meal: MealType, foodId: string, method: CookingMethod, portionDesc: string) => void;
  onAddCustomFood?: (meal: MealType, customEntry: Partial<MenuEntry>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  foods, templates, currentPlan, activeDayIndex, dayStats,
  onUpdatePlan, onApplyTemplate, onSaveCurrentTemplate, onDeleteTemplate, onAddFood, onAddCustomFood
}) => {
  return (
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto p-4 no-print space-y-6 shadow-xl z-20">

      <TemplateSelector
        templates={templates}
        onApply={onApplyTemplate}
        onSaveCurrent={onSaveCurrentTemplate}
        onDelete={onDeleteTemplate}
      />

      <div className="pt-4 border-t">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          <i className="fas fa-calculator text-emerald-500"></i> 1. 設定熱量與營養比例
        </h3>
        <MacroConfigurator
          currentPlan={currentPlan}
          onUpdatePlan={onUpdatePlan}
        />
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          <i className="fas fa-bullseye text-emerald-500"></i> 2. 設定六大類份數
        </h3>
        <PortionConfigurator
          currentPlan={currentPlan}
          dayStats={dayStats}
          onUpdatePlan={onUpdatePlan}
        />
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          <i className="fas fa-plus-circle text-emerald-500"></i> 3. 選擇食物
        </h3>
        <AddFoodForm
          foods={foods}
          activeDayIndex={activeDayIndex}
          onAdd={onAddFood}
          onAddCustom={onAddCustomFood}
        />
      </div>
    </div>
  );
};

export default Sidebar;
