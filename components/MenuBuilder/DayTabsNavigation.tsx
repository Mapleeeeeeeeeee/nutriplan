import React from 'react';

interface DayTabsNavigationProps {
    days: any[];
    activeDayIndex: number;
    dayStats: Array<{ totals: { calories: number } }>;
    onDayChange: (index: number) => void;
    onCopyDay: () => void;
    onSetDays: () => void;
}

const DayTabsNavigation: React.FC<DayTabsNavigationProps> = ({
    days,
    activeDayIndex,
    dayStats,
    onDayChange,
    onCopyDay,
    onSetDays
}) => {
    return (
        <div className="bg-white border-b px-6 py-4 no-print flex items-center justify-between overflow-x-auto shrink-0 shadow-sm relative z-30">
            <div className="flex gap-2">
                {days.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => onDayChange(idx)}
                        className={`min-w-[80px] px-3 py-2 rounded-xl text-xs font-bold transition-all border ${activeDayIndex === idx
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600'
                            }`}
                    >
                        <div className="uppercase tracking-wider opacity-80 mb-0.5">Day {idx + 1}</div>
                        <div className={`text-[10px] ${activeDayIndex === idx ? 'text-white' : 'text-slate-500'}`}>
                            {dayStats[idx].totals.calories.toFixed(0)} cal
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <button
                    onClick={onCopyDay}
                    className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95 select-none"
                    title="將目前這天的菜單複製到另一天"
                >
                    <i className="far fa-copy"></i> 複製 D{activeDayIndex + 1} 到...
                </button>
                <button
                    onClick={onSetDays}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2 py-2 rounded-lg transition whitespace-nowrap cursor-pointer active:scale-95 select-none"
                >
                    <i className="fas fa-cog"></i> 設定天數
                </button>
            </div>
        </div>
    );
};

export default DayTabsNavigation;
