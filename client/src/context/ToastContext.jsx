import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    XCircle,
} from "lucide-react";

import "../styles/toast.css";

const ToastContext = createContext(null);

const toastIcons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((current) =>
            current.filter((toast) => toast.id !== id)
        );
    }, []);

    const showToast = useCallback((type, message, options = {}) => {
        const id = `${Date.now()}-${Math.random()}`;
        const duration = options.duration ?? 4000;

        setToasts((current) => [
            ...current,
            { id, type, message, duration },
        ]);

        return id;
    }, []);

    const toast = {
        success: (message, options) =>
            showToast("success", message, options),
        error: (message, options) =>
            showToast("error", message, options),
        warning: (message, options) =>
            showToast("warning", message, options),
        info: (message, options) =>
            showToast("info", message, options),
        dismiss: removeToast,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container" aria-live="polite" aria-atomic="true">
                {toasts.map((item) => (
                    <ToastItem
                        key={item.id}
                        toast={item}
                        onDismiss={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onDismiss }) => {
    const Icon = toastIcons[toast.type] || Info;

    useEffect(() => {
        const timeout = setTimeout(() => {
            onDismiss(toast.id);
        }, toast.duration);

        return () => clearTimeout(timeout);
    }, [onDismiss, toast.id]);

    return (
        <div className={`toast toast-${toast.type}`} role="status">
            <Icon size={19} aria-hidden="true" />
            <span>{toast.message}</span>
            <button
                type="button"
                className="toast-dismiss"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }

    return context;
};