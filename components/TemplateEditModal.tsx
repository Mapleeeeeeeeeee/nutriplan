import React, { useState } from 'react';
import { MealTemplate } from '../types';

interface TemplateEditModalProps {
    template: MealTemplate | null;
    show: boolean;
    onClose: () => void;
    onSave: (id: string, updates: Partial<MealTemplate>) => void;
}

const TemplateEditModal: React.FC<TemplateEditModalProps> = ({
    template,
    show,
    onClose,
    onSave
}) => {
    const [name, setName] = useState(template?.name || '');
    const [note, setNote] = useState(template?.note || '');

    React.useEffect(() => {
        if (template) {
            setName(template.name);
            setNote(template.note);
        }
    }, [template]);

    if (!show || !template) return null;

    const handleSave = () => {
        onSave(template.id, { name, note });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto" style={{ animation: 'modalFadeIn 0.2s ease-out' }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <i className="fas fa-edit"></i>
                    </div>
                    <h3 className="text-xl font-black text-slate-800">編輯腳本</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            腳本名稱
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="輸入腳本名稱"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            備註說明
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            placeholder="輸入營養師小叮嚀或備註"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                            <div className="text-sm text-blue-700">
                                <p className="font-semibold mb-1">提示</p>
                                <p>食材清單和營養比例目前無法直接編輯，如需修改請在菜單規劃頁面重新建立腳本。</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        儲存變更
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateEditModal;
