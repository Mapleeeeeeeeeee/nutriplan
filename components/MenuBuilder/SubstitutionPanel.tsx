import React from 'react';
import { FoodItem } from '../../types';

interface SubstitutionPanelProps {
    show: boolean;
    targetFood: FoodItem | undefined;
    suggestions: any[];
    isLoading: boolean;
    onApply: (suggestion: any) => void;
    onClose: () => void;
}

const SubstitutionPanel: React.FC<SubstitutionPanelProps> = ({
    show,
    targetFood,
    suggestions,
    isLoading,
    onApply,
    onClose
}) => {
    if (!show) return null;

    return (
        <div className="absolute right-0 top-0 w-80 h-full bg-white shadow-2xl z-20 border-l border-gray-100 flex flex-col no-print animate-slide-in">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="font-black text-slate-800 text-sm">AI 智慧同值替換</h3>
                    <p className="text-[10px] text-slate-400">原品項：{targetFood?.name || ''}</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-gray-100 rounded-full transition"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                        <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                        <span className="text-[10px] font-bold">AI 正全力搜尋替代方案...</span>
                    </div>
                ) : (
                    suggestions.map((sub, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-xl hover:border-emerald-200 transition group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-black text-emerald-700 text-sm">{sub.name}</span>
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">同類替換</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{sub.reason}</p>
                            <button
                                onClick={() => onApply(sub)}
                                className="w-full py-2 bg-slate-800 text-white text-xs rounded-xl hover:bg-emerald-600 shadow-sm transition-all active:scale-95 font-black"
                            >
                                採用此建議
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SubstitutionPanel;
