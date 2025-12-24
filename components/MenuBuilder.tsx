
import React, { useState } from 'react';
import { FoodItem, MenuPlan, MealType, MenuEntry, CookingMethod, DailyItems, MealTemplate, MealChoiceOption, MealData } from '../types';
import { CATEGORY_LABELS } from '../constants';
import NutritionChart from './NutritionChart';
import Sidebar from './Sidebar/Sidebar';
import DailyMenu from './DailyMenu';
import { getSubstitutes } from '../services/geminiService';
import { useMenuStats } from '../hooks/useMenuStats';
import { useToast } from '../hooks/useToast';
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

// 創建空的 MealData
const createEmptyMealData = (): MealData => ({ entries: [] });

// 創建空的 DailyItems
const createEmptyDay = (): DailyItems => ({
  breakfast: createEmptyMealData(),
  lunch: createEmptyMealData(),
  dinner: createEmptyMealData(),
  snack: createEmptyMealData()
});

const MenuBuilder: React.FC<MenuBuilderProps> = ({ foods, templates, onAddTemplate, onDeleteTemplate, onSaveMenu }) => {
  const [currentPlan, setCurrentPlan] = useState<MenuPlan>({
    id: '',
    name: '新計畫菜單',
    type: 'single',
    cycleDays: 1,
    targetCalories: 1500,
    macroRatio: { protein: 20, carbs: 50, fat: 30 },
    targetPortions: { staple: 3, meat: 5, vegetable: 3, fruit: 2, dairy: 1, fat: 3, other: 0 },
    createdAt: Date.now(),
    days: [createEmptyDay()],
    notes: ['']
  });

  // ABC 選擇模式狀態
  const [activeChoiceOption, setActiveChoiceOption] = useState<{ meal: MealType; optionId: string } | null>(null);

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const { showToast, toastMsg, triggerToast } = useToast();

  // Substitutes state
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [targetEntry, setTargetEntry] = useState<{ meal: MealType, entry: MenuEntry } | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);

  // Modal State
  const [activeModal, setActiveModal] = useState<'copy' | 'setDays' | null>(null);
  const [modalValue, setModalValue] = useState('');
  const [showJsonExport, setShowJsonExport] = useState(false);
  const [showSaveTemplatePrompt, setShowSaveTemplatePrompt] = useState(false);

  const getFood = (id: string) => foods.find(f => f.id === id);
  const { stats, targetGrams } = useMenuStats(currentPlan, foods, activeChoiceOption);

  const handleAddFood = (meal: MealType, foodId: string, method: CookingMethod, portionDesc: string) => {
    const food = getFood(foodId);
    const amount = 1;
    const newEntry: MenuEntry = {
      id: Math.random().toString(36).substr(2, 9),
      foodId: foodId,
      amount: amount,
      cookingMethod: method,
      portionDescription: portionDesc.includes('份') ? portionDesc : `${portionDesc} 份${food ? CATEGORY_LABELS[food.category] : ''}`,
      portionValue: parseFloat(portionDesc) || amount
    };

    const newDays = [...currentPlan.days];
    const mealData = newDays[activeDayIndex][meal];

    // 檢查是否為選擇模式且有選中的選項
    if (mealData.choice?.enabled && activeChoiceOption?.meal === meal && activeChoiceOption.optionId) {
      // 添加到選中的選項
      const updatedChoice = {
        ...mealData.choice,
        options: mealData.choice.options.map(opt =>
          opt.id === activeChoiceOption.optionId
            ? { ...opt, entries: [...opt.entries, newEntry] }
            : opt
        )
      };
      newDays[activeDayIndex] = {
        ...newDays[activeDayIndex],
        [meal]: { ...mealData, choice: updatedChoice }
      };
    } else {
      // 單一模式：添加到 entries
      newDays[activeDayIndex] = {
        ...newDays[activeDayIndex],
        [meal]: { ...mealData, entries: [...mealData.entries, newEntry] }
      };
    }

    setCurrentPlan(prev => ({ ...prev, days: newDays }));
  };

  const handleSaveCurrentAsTemplate = () => {
    setShowSaveTemplatePrompt(true);
  };

  const confirmSaveTemplate = (name: string) => {
    setShowSaveTemplatePrompt(false);

    const currentDay = currentPlan.days[activeDayIndex];
    const items: any[] = [];

    (Object.keys(currentDay) as MealType[]).forEach(meal => {
      const mealData = currentDay[meal];
      // 單一模式
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
      macroRatio: tpl.macroRatio || prev.macroRatio
    }));

    triggerToast(`已套用「${tpl.name}」`);
  };

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
          newDays.push({ breakfast: [], lunch: [], dinner: [], snack: [] });
          newNotes.push('');
        }

        const dayToCopy = newDays[fromIdx];
        const cloneEntries = (entries: MenuEntry[]) => entries.map(e => ({ ...e, id: Math.random().toString(36).substr(2, 9) }));

        if (dayToCopy) {
          newDays[targetIdx] = {
            breakfast: cloneEntries(dayToCopy.breakfast),
            lunch: cloneEntries(dayToCopy.lunch),
            dinner: cloneEntries(dayToCopy.dinner),
            snack: cloneEntries(dayToCopy.snack)
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
            newDays.push({ breakfast: [], lunch: [], dinner: [], snack: [] });
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

  const removeEntry = (meal: MealType, entryId: string) => {
    const newDays = [...currentPlan.days];
    const mealData = newDays[activeDayIndex][meal];
    newDays[activeDayIndex] = {
      ...newDays[activeDayIndex],
      [meal]: { ...mealData, entries: mealData.entries.filter(e => e.id !== entryId) }
    };
    setCurrentPlan(prev => ({ ...prev, days: newDays }));
  };

  const updateEntryField = (meal: MealType, entryId: string, field: keyof MenuEntry, value: string) => {
    const newDays = [...currentPlan.days];
    const mealData = newDays[activeDayIndex][meal];

    const updatedEntries = mealData.entries.map(e => {
      if (e.id === entryId) {
        const updatedEntry = { ...e, [field]: value };
        if (field === 'portionDescription') {
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) {
            updatedEntry.portionValue = parsed;
          }
        }
        return updatedEntry;
      }
      return e;
    });

    newDays[activeDayIndex] = {
      ...newDays[activeDayIndex],
      [meal]: { ...mealData, entries: updatedEntries }
    };
    setCurrentPlan(prev => ({ ...prev, days: newDays }));
  };

  // ============= ABC 選擇模式 Handlers =============

  const toggleChoiceMode = (meal: MealType) => {
    const newDays = [...currentPlan.days];
    const mealData = newDays[activeDayIndex][meal];
    const currentChoice = mealData.choice || { enabled: false, options: [] };

    // 切換模式
    const newEnabled = !currentChoice.enabled;
    let newOptions = currentChoice.options;

    // 如果啟用選擇模式且沒有選項，自動創建一個
    if (newEnabled && newOptions.length === 0) {
      newOptions = [{
        id: Math.random().toString(36).substr(2, 9),
        label: '選項 A',
        entries: []
      }];
    }

    newDays[activeDayIndex] = {
      ...newDays[activeDayIndex],
      [meal]: {
        ...mealData,
        choice: { enabled: newEnabled, options: newOptions }
      }
    };

    // 如果啟用選擇模式，自動選中第一個選項
    if (newEnabled && newOptions.length > 0) {
      setActiveChoiceOption({ meal, optionId: newOptions[0].id });
    } else {
      setActiveChoiceOption(null);
    }

    setCurrentPlan(prev => ({ ...prev, days: newDays }));
  };

  const addChoiceOption = (meal: MealType) => {
    const newDays = [...currentPlan.days];
    const mealData = newDays[activeDayIndex][meal];
    const currentChoice = mealData.choice || { enabled: true, options: [] };

    const optionCount = currentChoice.options.length;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const newOption: MealChoiceOption = {
      id: Math.random().toString(36).substr(2, 9),
      label: `選項 ${letters[optionCount] || optionCount + 1}`,
      entries: []
    };

    newDays[activeDayIndex] = {
      ...newDays[activeDayIndex],
      [meal]: {
        ...mealData,
        choice: {
          ...currentChoice,
          options: [...currentChoice.options, newOption]
        }
      }
    };

    // 自動選中新增的選項
    setActiveChoiceOption({ meal, optionId: newOption.id });
    setCurrentPlan(prev => ({ ...prev, days: newDays }));
  };

  const updateChoiceOption = (meal: MealType, optionId: string, updates: Partial<MealChoiceOption>) => {
    const newDays = [...currentPlan.days];
    const mealData = newDays[activeDayIndex][meal];
    if (!mealData.choice) return;

    newDays[activeDayIndex] = {
      ...newDays[activeDayIndex],
      [meal]: {
        ...mealData,
        choice: {
          ...mealData.choice,
          options: mealData.choice.options.map(opt =>
            opt.id === optionId ? { ...opt, ...updates } : opt
          )
        }
      }
    };
    setCurrentPlan(prev => ({ ...prev, days: newDays }));
  };

  const removeChoiceOption = (meal: MealType, optionId: string) => {
    const newDays = [...currentPlan.days];
    const mealData = newDays[activeDayIndex][meal];
    if (!mealData.choice) return;

    const newOptions = mealData.choice.options.filter(opt => opt.id !== optionId);

    newDays[activeDayIndex] = {
      ...newDays[activeDayIndex],
      [meal]: {
        ...mealData,
        choice: {
          ...mealData.choice,
          options: newOptions
        }
      }
    };

    // 如果刪除的是當前選中的選項，選中第一個或清空
    if (activeChoiceOption?.optionId === optionId) {
      if (newOptions.length > 0) {
        setActiveChoiceOption({ meal, optionId: newOptions[0].id });
      } else {
        setActiveChoiceOption(null);
      }
    }

    setCurrentPlan(prev => ({ ...prev, days: newDays }));
  };

  const removeChoiceEntry = (meal: MealType, optionId: string, entryId: string) => {
    const newDays = [...currentPlan.days];
    const mealData = newDays[activeDayIndex][meal];
    if (!mealData.choice) return;

    newDays[activeDayIndex] = {
      ...newDays[activeDayIndex],
      [meal]: {
        ...mealData,
        choice: {
          ...mealData.choice,
          options: mealData.choice.options.map(opt =>
            opt.id === optionId
              ? { ...opt, entries: opt.entries.filter(e => e.id !== entryId) }
              : opt
          )
        }
      }
    };
    setCurrentPlan(prev => ({ ...prev, days: newDays }));
  };

  const updateChoiceEntryField = (
    meal: MealType,
    optionId: string,
    entryId: string,
    field: keyof MenuEntry,
    value: string
  ) => {
    const newDays = [...currentPlan.days];
    const mealData = newDays[activeDayIndex][meal];
    if (!mealData.choice) return;

    newDays[activeDayIndex] = {
      ...newDays[activeDayIndex],
      [meal]: {
        ...mealData,
        choice: {
          ...mealData.choice,
          options: mealData.choice.options.map(opt =>
            opt.id === optionId
              ? {
                ...opt,
                entries: opt.entries.map(e => {
                  if (e.id === entryId) {
                    const updatedEntry = { ...e, [field]: value };
                    if (field === 'portionDescription') {
                      const parsed = parseFloat(value);
                      if (!isNaN(parsed)) {
                        updatedEntry.portionValue = parsed;
                      }
                    }
                    return updatedEntry;
                  }
                  return e;
                })
              }
              : opt
          )
        }
      }
    };
    setCurrentPlan(prev => ({ ...prev, days: newDays }));
  };

  const selectChoiceOption = (meal: MealType, optionId: string) => {
    setActiveChoiceOption({ meal, optionId });
  };

  const updateNote = (dayIdx: number, text: string) => {
    const newNotes = [...(currentPlan.notes || new Array(currentPlan.days.length).fill(''))];
    newNotes[dayIdx] = text;
    setCurrentPlan(prev => ({ ...prev, notes: newNotes }));
  };

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
        onAddFood={handleAddFood}
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
