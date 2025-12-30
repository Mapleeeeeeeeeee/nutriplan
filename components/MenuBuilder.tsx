
import React, { useState } from 'react';
import { FoodItem, MenuPlan, MealType, MenuEntry, CookingMethod, DailyItems, MealTemplate, MealChoiceOption, MealData } from '../types';
import { CATEGORY_LABELS } from '../constants';
import NutritionChart from './NutritionChart';
import Sidebar from './Sidebar/Sidebar';
import DailyMenu from './DailyMenu';
import { getSubstitutes } from '../services/geminiService';
import { useMenuStats } from '../hooks/useMenuStats';
import { useToast } from '../hooks/useToast';
import { useMenuPlan, createEmptyDay } from '../hooks/useMenuPlan';
import { useEntryActions } from '../hooks/useEntryActions';
import { useChoiceActions } from '../hooks/useChoiceActions';
import Toast from './MenuBuilder/Toast';
import DayTabsNavigation from './MenuBuilder/DayTabsNavigation';
import MenuModal from './MenuBuilder/MenuModal';
import SubstitutionPanel from './MenuBuilder/SubstitutionPanel';
import ChefNote from './MenuBuilder/ChefNote';
import JsonExportModal from './JsonExportModal';
import PromptModal from './PromptModal';

interface MenuBuilderProps {
  foods: FoodItem[];
  templates: MealTemplate[];
  onAddTemplate: (template: MealTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onSaveMenu: (plan: MenuPlan) => void;
}

const MenuBuilder: React.FC<MenuBuilderProps> = ({ foods, templates, onAddTemplate, onDeleteTemplate, onSaveMenu }) => {
  // ============= Custom Hooks =============
  const { currentPlan, setCurrentPlan, activeDayIndex, setActiveDayIndex, updateNote } = useMenuPlan();
  const { showToast, toastMsg, triggerToast } = useToast();

  const getFood = (id: string) => foods.find(f => f.id === id);

  const {
    activeChoiceOption,
    toggleChoiceMode,
    addChoiceOption,
    updateChoiceOption,
    removeChoiceOption,
    removeChoiceEntry,
    updateChoiceEntryField,
    selectChoiceOption
  } = useChoiceActions({ currentPlan, setCurrentPlan, activeDayIndex });

  const { addEntry, removeEntry, updateEntryField } = useEntryActions({
    currentPlan,
    setCurrentPlan,
    activeDayIndex,
    getFood,
    activeChoiceOption
  });

  const { stats, targetGrams } = useMenuStats(currentPlan, foods, activeChoiceOption);

  // ============= Local State =============
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [targetEntry, setTargetEntry] = useState<{ meal: MealType, entry: MenuEntry } | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [activeModal, setActiveModal] = useState<'copy' | 'setDays' | null>(null);
  const [modalValue, setModalValue] = useState('');
  const [showJsonExport, setShowJsonExport] = useState(false);
  const [showSaveTemplatePrompt, setShowSaveTemplatePrompt] = useState(false);

  // ============= Template Handlers =============
  const handleSaveCurrentAsTemplate = () => {
    setShowSaveTemplatePrompt(true);
  };

  const confirmSaveTemplate = (name: string) => {
    setShowSaveTemplatePrompt(false);
    const currentDay = currentPlan.days[activeDayIndex];
    const items: any[] = [];

    (Object.keys(currentDay) as MealType[]).forEach(meal => {
      const mealData = currentDay[meal];
      mealData.entries.forEach(entry => {
        items.push({
          meal,
          foodId: entry.foodId,
          amount: entry.amount,
          method: entry.cookingMethod,
          portionDesc: entry.portionDescription,
          customName: entry.customName
        });
      });
    });

    const newTemplate: MealTemplate = {
      id: Date.now().toString(),
      name,
      note: currentPlan.notes[activeDayIndex] || '',
      macroRatio: { ...currentPlan.macroRatio },
      targetPortions: { ...currentPlan.targetPortions },
      detailedPortions: currentPlan.detailedPortions ? { ...currentPlan.detailedPortions } : undefined,
      items
    };

    onAddTemplate(newTemplate);
    triggerToast(`已儲存腳本：${name}`);
  };

  const handleApplyTemplate = (tpl: MealTemplate) => {
    const newDayMeals: DailyItems = {
      breakfast: { entries: [] },
      lunch: { entries: [] },
      dinner: { entries: [] },
      snack: { entries: [] }
    };

    tpl.items.forEach((item: any) => {
      const mealKey = (item.meal as MealType) || 'breakfast';
      const entry: MenuEntry = {
        id: Math.random().toString(36).substr(2, 9),
        foodId: item.foodId,
        amount: item.amount,
        cookingMethod: item.method as CookingMethod,
        portionDescription: item.portionDesc,
        portionValue: item.amount,
        customName: item.customName
      };

      if (newDayMeals[mealKey]) {
        newDayMeals[mealKey].entries.push(entry);
      }
    });

    const newDays = [...currentPlan.days];
    newDays[activeDayIndex] = newDayMeals;

    const newNotes = [...(currentPlan.notes || new Array(currentPlan.days.length).fill(''))];
    if (tpl.note) {
      newNotes[activeDayIndex] = tpl.note;
    }

    setCurrentPlan(prev => ({
      ...prev,
      days: newDays,
      notes: newNotes,
      macroRatio: tpl.macroRatio || prev.macroRatio,
      targetPortions: tpl.targetPortions || prev.targetPortions,
      detailedPortions: tpl.detailedPortions || prev.detailedPortions
    }));

    triggerToast(`已套用「${tpl.name}」`);
  };

  // ============= Modal Handlers =============
  const openCopyModal = () => {
    setModalValue((activeDayIndex + 2).toString());
    setActiveModal('copy');
  };

  const openSetDaysModal = () => {
    setModalValue(currentPlan.days.length.toString());
    setActiveModal('setDays');
  };

  const handleModalSubmit = () => {
    if (activeModal === 'copy') {
      const targetIdx = parseInt(modalValue) - 1;
      if (isNaN(targetIdx) || targetIdx < 0 || targetIdx > 30) {
        alert("請輸入有效的天數 (1-31)");
        return;
      }
      const fromIdx = activeDayIndex;

      setCurrentPlan(prev => {
        const newDays = [...prev.days];
        const newNotes = [...(prev.notes || new Array(prev.days.length).fill(''))];

        while (newDays.length <= targetIdx) {
          newDays.push(createEmptyDay());
          newNotes.push('');
        }

        const dayToCopy = newDays[fromIdx];
        const cloneEntries = (entries: MenuEntry[]) => entries.map(e => ({ ...e, id: Math.random().toString(36).substr(2, 9) }));
        const cloneMealData = (mealData: MealData): MealData => ({
          entries: cloneEntries(mealData.entries),
          choice: mealData.choice ? {
            ...mealData.choice,
            options: mealData.choice.options.map(opt => ({
              ...opt,
              id: Math.random().toString(36).substr(2, 9),
              entries: cloneEntries(opt.entries)
            }))
          } : undefined
        });

        if (dayToCopy) {
          newDays[targetIdx] = {
            breakfast: cloneMealData(dayToCopy.breakfast),
            lunch: cloneMealData(dayToCopy.lunch),
            dinner: cloneMealData(dayToCopy.dinner),
            snack: cloneMealData(dayToCopy.snack)
          };
          newNotes[targetIdx] = newNotes[fromIdx];
        }

        return {
          ...prev,
          type: 'cycle',
          cycleDays: newDays.length,
          days: newDays,
          notes: newNotes
        };
      });
      triggerToast(`成功複製 D${fromIdx + 1} 到 D${targetIdx + 1}`);

    } else if (activeModal === 'setDays') {
      const n = parseInt(modalValue);
      if (!isNaN(n) && n > 0 && n <= 30) {
        setCurrentPlan(prev => {
          const newDays = [...prev.days];
          const newNotes = [...(prev.notes || new Array(prev.days.length).fill(''))];

          while (newDays.length < n) {
            newDays.push(createEmptyDay());
            newNotes.push('');
          }
          if (newDays.length > n) {
            newDays.splice(n);
            newNotes.splice(n);
          }
          return { ...prev, cycleDays: n, days: newDays, notes: newNotes };
        });
        if (activeDayIndex >= n) {
          setActiveDayIndex(n - 1);
        }
        triggerToast(`已設定計畫總天數為 ${n} 天`);
      } else {
        alert("請輸入有效的天數 (1-30)");
        return;
      }
    }
    setActiveModal(null);
  };

  // ============= Substitution Handlers =============
  const openSubPanel = async (meal: MealType, entry: MenuEntry) => {
    const food = getFood(entry.foodId);
    if (!food) return;
    setTargetEntry({ meal, entry });
    setShowSubPanel(true);
    setIsLoadingSubs(true);
    setAiSuggestions([]);
    try {
      const subs = await getSubstitutes(food.name, food.category);
      setAiSuggestions(subs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSubs(false);
    }
  };

  const applySwap = (suggestedFood: any) => {
    if (!targetEntry) return;
    alert(`替換成功！AI 建議品項已記錄 (功能模擬)。`);
    setShowSubPanel(false);
  };

  // ============= Render =============
  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden relative">
      <Toast show={showToast} message={toastMsg} />

      <MenuModal
        type={activeModal}
        value={modalValue}
        activeDayIndex={activeDayIndex}
        onValueChange={setModalValue}
        onSubmit={handleModalSubmit}
        onClose={() => setActiveModal(null)}
      />

      <Sidebar
        foods={foods}
        templates={templates}
        currentPlan={currentPlan}
        activeDayIndex={activeDayIndex}
        dayStats={stats.dayStats[activeDayIndex]}
        onUpdatePlan={setCurrentPlan}
        onApplyTemplate={handleApplyTemplate}
        onSaveCurrentTemplate={handleSaveCurrentAsTemplate}
        onDeleteTemplate={onDeleteTemplate}
        onAddFood={addEntry}
      />

      <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden relative">
        <DayTabsNavigation
          days={currentPlan.days}
          activeDayIndex={activeDayIndex}
          dayStats={stats.dayStats}
          onDayChange={setActiveDayIndex}
          onCopyDay={openCopyModal}
          onSetDays={openSetDaysModal}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-6 md:p-10 min-h-screen">
            <div className="flex justify-between items-center mb-10 no-print">
              <input className="text-2xl font-black bg-transparent border-b-2 border-transparent focus:border-emerald-500 outline-none w-full" value={currentPlan.name} onChange={e => setCurrentPlan({ ...currentPlan, name: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={() => setShowJsonExport(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm transition flex items-center gap-2 text-sm font-bold whitespace-nowrap">
                  <i className="fas fa-code"></i> 複製資料
                </button>
                <button onClick={() => triggerToast("圖卡連結已複製！")} className="bg-[#06c755] text-white px-4 py-2.5 rounded-xl hover:bg-[#05b04d] shadow-sm transition flex items-center gap-2 text-sm font-bold whitespace-nowrap">
                  <i className="fab fa-line text-lg"></i> 分享 Line
                </button>
                <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2.5 rounded-xl hover:bg-slate-900 flex items-center gap-2 text-sm font-bold whitespace-nowrap">
                  <i className="fas fa-print"></i> 列印菜單
                </button>
              </div>
            </div>

            <div className="space-y-12">
              {(currentPlan.type === 'single' ? [activeDayIndex] : currentPlan.days.map((_, i) => i)).map(dayIdx => (
                <div key={dayIdx} className={`bg-white rounded-2xl ${dayIdx !== activeDayIndex && currentPlan.type === 'cycle' ? 'print:block hidden' : 'block'}`}>
                  <div className="flex items-center gap-4 mb-6 group border-b border-gray-50 pb-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-lg">D{dayIdx + 1}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-800">{currentPlan.type === 'cycle' ? `第 ${dayIdx + 1} 天規劃` : '今日營養計畫'}</h3>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">總熱量: {stats.dayStats[dayIdx].totals.calories.toFixed(0)}</span>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">目標: {currentPlan.targetCalories}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <DailyMenu
                      currentPlan={currentPlan}
                      activeDayIndex={dayIdx}
                      foods={foods}
                      onUpdateEntryField={updateEntryField}
                      onRemoveEntry={removeEntry}
                      onOpenSubPanel={openSubPanel}
                      onToggleChoiceMode={toggleChoiceMode}
                      onAddChoiceOption={addChoiceOption}
                      onUpdateChoiceOption={updateChoiceOption}
                      onRemoveChoiceOption={removeChoiceOption}
                      onRemoveChoiceEntry={removeChoiceEntry}
                      onUpdateChoiceEntryField={updateChoiceEntryField}
                      activeChoiceOption={activeChoiceOption}
                      onSelectChoiceOption={selectChoiceOption}
                    />

                    <div className="space-y-6">
                      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center sticky top-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">三大營養素比例 (D{dayIdx + 1})</h5>
                        <div className="h-44 w-full">
                          <NutritionChart totals={stats.dayStats[dayIdx].totals} />
                        </div>
                        <div className="grid grid-cols-1 gap-2 w-full mt-6">
                          {/* 菜單總熱量 */}
                          <div className="bg-orange-50 rounded-2xl p-3 border border-orange-200 flex justify-between items-center shadow-sm">
                            <span className="text-[10px] font-bold text-orange-500">菜單熱量</span>
                            <div className="text-right">
                              <span className="font-black text-orange-600 block text-lg">{stats.dayStats[dayIdx].totals.calories.toFixed(0)}</span>
                              <span className="text-[10px] text-gray-400">目標 {currentPlan.targetCalories} kcal</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-2xl p-3 border border-gray-100 flex justify-between items-center shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400">蛋白質</span>
                            <div className="text-right">
                              <span className="font-black text-emerald-600 block">{stats.dayStats[dayIdx].totals.protein.toFixed(0)}g</span>
                              <span className="text-[10px] text-gray-400">目標 {targetGrams.protein.toFixed(0)}g</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-2xl p-3 border border-gray-100 flex justify-between items-center shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400">脂肪</span>
                            <div className="text-right">
                              <span className="font-black text-blue-600 block">{stats.dayStats[dayIdx].totals.fat.toFixed(0)}g</span>
                              <span className="text-[10px] text-gray-400">目標 {targetGrams.fat.toFixed(0)}g</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-2xl p-3 border border-gray-100 flex justify-between items-center shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400">碳水</span>
                            <div className="text-right">
                              <span className="font-black text-amber-600 block">{stats.dayStats[dayIdx].totals.carbs.toFixed(0)}g</span>
                              <span className="text-[10px] text-gray-400">目標 {targetGrams.carbs.toFixed(0)}g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ChefNote
                    dayIndex={dayIdx}
                    note={currentPlan.notes?.[dayIdx] || ''}
                    onNoteChange={updateNote}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SubstitutionPanel
        show={showSubPanel}
        targetFood={getFood(targetEntry?.entry.foodId || '')}
        suggestions={aiSuggestions}
        isLoading={isLoadingSubs}
        onApply={applySwap}
        onClose={() => setShowSubPanel(false)}
      />

      <JsonExportModal
        show={showJsonExport}
        jsonData={currentPlan}
        onClose={() => setShowJsonExport(false)}
      />

      <PromptModal
        show={showSaveTemplatePrompt}
        title="儲存腳本"
        message="請為此快速腳本命名："
        defaultValue={"新腳本 " + new Date().toLocaleDateString()}
        placeholder="輸入腳本名稱"
        confirmText="儲存"
        onConfirm={confirmSaveTemplate}
        onCancel={() => setShowSaveTemplatePrompt(false)}
      />
    </div>
  );
};

export default MenuBuilder;
