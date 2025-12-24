import React from 'react';

interface MealChoiceToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

const MealChoiceToggle: React.FC<MealChoiceToggleProps> = ({ enabled, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${enabled
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            title={enabled ? '關閉 ABC 選擇模式' : '啟用 ABC 選擇模式'}
        >
            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black ${enabled ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                A
            </span>
            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black ${enabled ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                B
            </span>
            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black ${enabled ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                C
            </span>
            <span className="ml-1">{enabled ? '選擇模式' : 'ABC'}</span>
        </button>
    );
};

export default MealChoiceToggle;
