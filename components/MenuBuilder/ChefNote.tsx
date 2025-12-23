import React from 'react';

interface ChefNoteProps {
    dayIndex: number;
    note: string;
    onNoteChange: (dayIdx: number, text: string) => void;
}

const ChefNote: React.FC<ChefNoteProps> = ({ dayIndex, note, onNoteChange }) => {
    return (
        <div className="mt-8 p-6 bg-amber-50/50 rounded-[2.5rem] border border-amber-100 relative overflow-hidden group">
            <div className="absolute right-[-15px] bottom-[-15px] opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <i className="fas fa-comments text-[8rem] text-amber-600"></i>
            </div>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-[10px]">
                    <i className="fas fa-pen"></i>
                </div>
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                    營養師小叮嚀 / 衛教備註
                </span>
            </div>
            <textarea
                className="w-full bg-white/70 border border-amber-200/50 rounded-2xl p-4 text-sm text-gray-700 placeholder-amber-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-300 resize-none h-32 shadow-inner transition-all"
                placeholder="在此輸入給客戶的專屬貼心提醒..."
                value={note}
                onChange={(e) => onNoteChange(dayIndex, e.target.value)}
            />
        </div>
    );
};

export default ChefNote;
