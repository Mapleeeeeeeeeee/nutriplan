
import React from 'react';
import { MealTemplate } from '../../types';

interface TemplateSelectorProps {
  templates: MealTemplate[];
  onApply: (tpl: MealTemplate) => void;
  onSaveCurrent: () => void;
  onDelete: (id: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onApply, onSaveCurrent, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <i className="fas fa-file-import text-purple-500"></i> 快速腳本 (全日)
        </h3>
        <button onClick={onSaveCurrent} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition" title="將今日菜單存為新腳本">
          <i className="fas fa-save"></i> 存為腳本
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
        {templates.map((tpl) => (
          <div 
            key={tpl.id}
            className="relative group text-xs bg-slate-50 hover:bg-emerald-50 rounded-xl transition border border-slate-200 hover:border-emerald-300"
          >
            <button 
              onClick={() => onApply(tpl)}
              className="w-full text-left p-3 pr-8"
            >
              <div className="font-bold text-slate-700 group-hover:text-emerald-700">{tpl.name}</div>
              <div className="text-[10px] text-gray-400 mt-1">C:{tpl.macroRatio.carbs}% P:{tpl.macroRatio.protein}% F:{tpl.macroRatio.fat}%</div>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(tpl.id); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
