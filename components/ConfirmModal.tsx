import React, { useState, useEffect, useCallback } from 'react';

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    show,
    title,
    message,
    confirmText = '確認',
    cancelText = '取消',
    onConfirm,
    onCancel,
    variant = 'danger'
}) => {
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

    const variantStyles = {
        danger: {
            icon: 'fa-exclamation-triangle',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBtn: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            icon: 'fa-exclamation-circle',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            confirmBtn: 'bg-amber-600 hover:bg-amber-700'
        },
        info: {
            icon: 'fa-info-circle',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const styles = variantStyles[variant];

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                style={{ animation: 'modalFadeIn 0.2s ease-out' }}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <i className={`fas ${styles.icon} ${styles.iconColor} text-xl`}></i>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                            <p className="text-slate-600 mt-2">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-white font-bold ${styles.confirmBtn} transition`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
