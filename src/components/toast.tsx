import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  AppToastProviderShell,
  closeAppToast,
  showAppToast,
  type AppToastType,
} from './ui/toast';

export type ToastType = AppToastType;

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  /** HeroUI 队列驱动，本地不再维护列表；保留字段以兼容旧调用 */
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const showToast = useCallback((type: ToastType, message: string, duration: number = 3000) => {
    showAppToast(type, message, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    closeAppToast(id);
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => showToast('success', message, duration),
    [showToast],
  );
  const error = useCallback(
    (message: string, duration?: number) => showToast('error', message, duration),
    [showToast],
  );
  const warning = useCallback(
    (message: string, duration?: number) => showToast('warning', message, duration),
    [showToast],
  );
  const info = useCallback(
    (message: string, duration?: number) => showToast('info', message, duration),
    [showToast],
  );

  const value = useMemo(
    () => ({
      toasts: [] as Toast[],
      showToast,
      success,
      error,
      warning,
      info,
      removeToast,
    }),
    [showToast, success, error, warning, info, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      <AppToastProviderShell>{children}</AppToastProviderShell>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
