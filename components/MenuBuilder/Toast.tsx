import React from 'react';

interface ToastProps {
    show: boolean;
    message: string;
}

const Toast: React.FC<ToastProps> = ({ show, message }) => {
    if (!show) return null;

    return (
        <div
            className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3"
            style={{
                animation: 'fadeInDown 0.3s ease-out'
            }}
        >
            <i className="fas fa-check-circle text-emerald-400"></i>
            <span className="font-bold text-sm">{message}</span>
        </div>
    );
};

export default Toast;
