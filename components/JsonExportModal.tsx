import React, { useState } from 'react';

interface JsonExportModalProps {
    show: boolean;
    jsonData: any;
    onClose: () => void;
}

const JsonExportModal: React.FC<JsonExportModalProps> = ({ show, jsonData, onClose }) => {
    const [copied, setCopied] = useState(false);

    if (!show) return null;

    const jsonString = JSON.stringify(jsonData, null, 2);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert('複製失敗，請手動選取複製');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col" style={{ animation: 'modalFadeIn 0.2s ease-out' }}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <i className="fas fa-code"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800">匯出菜單資料</h3>
                            <p className="text-sm text-gray-500">請完整複製以下內容</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
                    >
                        <i className="fas fa-times text-gray-400"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="bg-slate-900 rounded-2xl p-6 overflow-auto flex-1 relative">
                        <pre className="text-emerald-400 text-sm font-mono leading-relaxed">
                            {jsonString}
                        </pre>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleCopy}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2"
                    >
                        <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                        {copied ? '已複製！' : '一鍵複製'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                    >
                        關閉
                    </button>
                </div>

                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <i className="fas fa-lightbulb text-amber-500 mt-0.5"></i>
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold mb-1">使用提示</p>
                            <p>複製此 JSON 資料後，您可以將其儲存為備份，或分享給其他營養師。未來可能會支援匯入功能。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JsonExportModal;
