import React from 'react';

interface MenuModalProps {
    type: 'copy' | 'setDays' | null;
    value: string;
    activeDayIndex: number;
    onValueChange: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({
    type,
    value,
    activeDayIndex,
    onValueChange,
    onSubmit,
    onClose
}) => {
    if (!type) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-gray-100" style={{ animation: 'modalFadeIn 0.2s ease-out' }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <i className={`fas ${type === 'copy' ? 'fa-copy' : 'fa-calendar-alt'}`}></i>
                    </div>
                    <h3 className="text-xl font-black text-slate-800">
                        {type === 'copy' ? '複製當日行程' : '設定計畫總天數'}
                    </h3>
                </div>

                {type === 'copy' && (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            將 D{activeDayIndex + 1} 複製到 Day
                        </label>
                        <input
                            type="number"
                            className="w-full text-3xl font-black border-b-2 border-emerald-500 focus:outline-none py-2 text-slate-700 bg-transparent placeholder-gray-200"
                            placeholder="ex. 2"
                            value={value}
                            onChange={e => onValueChange(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-2">若輸入的天數超過目前範圍，系統將自動新增天數。</p>
                    </div>
                )}

                {type === 'setDays' && (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            計畫總天數
                        </label>
                        <input
                            type="number"
                            className="w-full text-3xl font-black border-b-2 border-emerald-500 focus:outline-none py-2 text-slate-700 bg-transparent placeholder-gray-200"
                            placeholder="ex. 7"
                            value={value}
                            onChange={e => onValueChange(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-2">設定後若天數減少，多餘的日期資料將被移除。</p>
                    </div>
                )}

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                    >
                        取消
                    </button>
                    <button
                        onClick={onSubmit}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition"
                    >
                        確認執行
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuModal;
