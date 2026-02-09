import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Create context for toast notifications
const ToastContext = createContext(null);

// Toast types with icons and colors
const toastStyles = {
    success: {
        bg: 'rgba(16, 185, 129, 0.9)',
        border: '#10b981',
        icon: '✓'
    },
    error: {
        bg: 'rgba(239, 68, 68, 0.9)',
        border: '#ef4444',
        icon: '✕'
    },
    warning: {
        bg: 'rgba(245, 158, 11, 0.9)',
        border: '#f59e0b',
        icon: '⚠'
    },
    info: {
        bg: 'rgba(59, 130, 246, 0.9)',
        border: '#3b82f6',
        icon: 'ℹ'
    }
};

// Individual Toast component
const Toast = ({ id, message, type, onClose }) => {
    const style = toastStyles[type] || toastStyles.info;

    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 4000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                animation: 'slideIn 0.3s ease-out',
                cursor: 'pointer',
                maxWidth: '350px'
            }}
            onClick={() => onClose(id)}
        >
            <span style={{ fontSize: '18px' }}>{style.icon}</span>
            <span style={{ flex: 1 }}>{message}</span>
            <span style={{ opacity: 0.7, fontSize: '16px' }}>×</span>
        </div>
    );
};

// Toast Container component
const ToastContainer = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}
        >
            <style>
                {`
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}
            </style>
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
};

// Toast Provider component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // Convenience methods
    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
        info: (msg) => addToast(msg, 'info')
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

// Hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        // Return no-op functions if outside provider
        return {
            success: () => { },
            error: () => { },
            warning: () => { },
            info: () => { }
        };
    }
    return context;
};

export default ToastProvider;
