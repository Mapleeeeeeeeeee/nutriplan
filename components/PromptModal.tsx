import React, { useState, useEffect, useCallback, useRef } from 'react';

interface PromptModalProps {
    show: boolean;
    title: string;
    message: string;
    defaultValue?: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

const PromptModal: React.FC<PromptModalProps> = ({
    show,
    title,
    message,
    defaultValue = '',
    placeholder = '',
    confirmText = '確認',
    cancelText = '取消',
    onConfirm,
    onCancel
}) => {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (show) {
            setValue(defaultValue);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [show, defaultValue]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onConfirm(value.trim());
        }
    }, [value, onConfirm]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    }, [onCancel]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && show) {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [show, onCancel]);

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                style={{ animation: 'modalFadeIn 0.2s ease-out' }}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-edit text-emerald-600 text-xl"></i>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                                <p className="text-slate-600 mt-2">{message}</p>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={placeholder}
                                    className="mt-4 w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            disabled={!value.trim()}
                            className="px-4 py-2 rounded-xl text-white font-bold bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromptModal;
