import { useState, useCallback } from 'react';

export const useToast = () => {
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const triggerToast = useCallback((msg: string) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, []);

    return { showToast, toastMsg, triggerToast };
};
