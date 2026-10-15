// 全局Toast管理器
// 这个模块提供了一个全局的toast实例，可以在axios等非React环境中使用

import { ToastType } from '../components/toast';

type ToastCallback = (type: ToastType, message: string, duration?: number) => void;

let toastCallback: ToastCallback | null = null;

// 注册toast回调
export const registerToastCallback = (callback: ToastCallback) => {
  toastCallback = callback;
};

// 取消注册
export const unregisterToastCallback = () => {
  toastCallback = null;
};

// 显示toast的全局方法
const showGlobalToast = (type: ToastType, message: string, duration?: number) => {
  if (toastCallback) {
    toastCallback(type, message, duration);
  } else {
    // 如果没有注册，使用console作为后备
    console.warn(`[Toast] ${type}: ${message}`);
  }
};

// 快捷方法
export const showSuccessToast = (message: string, duration?: number) => {
  showGlobalToast('success', message, duration);
};

export const showErrorToast = (message: string, duration?: number) => {
  showGlobalToast('error', message, duration);
};

export const showWarningToast = (message: string, duration?: number) => {
  showGlobalToast('warning', message, duration);
};

export const showInfoToast = (message: string, duration?: number) => {
  showGlobalToast('info', message, duration);
};
