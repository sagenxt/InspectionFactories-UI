import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const showSuccess = (message) => {
        toast.success(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#10B981',
                color: '#fff',
            },
        });
    };

    const showError = (message) => {
        toast.error(message, {
            duration: 5000,
            position: 'top-right',
            style: {
                background: '#EF4444',
                color: '#fff',
            },
        });
    };

    const showWarning = (message) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: '⚠️',
            style: {
                background: '#F59E0B',
                color: '#fff',
            },
        });
    };

    const showInfo = (message) => {
        toast(message, {
            duration: 3000,
            position: 'top-right',
            icon: 'ℹ️',
            style: {
                background: '#3B82F6',
                color: '#fff',
            },
        });
    };

    const showLoading = (message) => {
        return toast.loading(message, {
            position: 'top-right',
        });
    };

    const dismissToast = (toastId) => {
        toast.dismiss(toastId);
    };

    const value = {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        dismissToast,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    className: '',
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 4000,
                        style: {
                            background: '#10B981',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: '#EF4444',
                        },
                    },
                }}
            />
        </ToastContext.Provider>
    );
};
