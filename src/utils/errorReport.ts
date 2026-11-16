import { getErrorMessage, isPresentedError } from './error';
import { showErrorToast, showWarningToast } from './toastManager';
import { ApiError } from './error';

/**
 * 用户可见的错误文案：优先用服务端/异常自带消息，兜底给中文提示。
 * （getErrorMessage 的兜底是英文，直接展示给用户不合适）
 */
export const getUserFacingErrorMessage = (
  error: unknown,
  fallback = '操作失败，请稍后重试',
): string => {
  const message = getErrorMessage(error);
  if (!message || message === 'An unexpected error occurred') {
    return fallback;
  }
  return message;
};

/**
 * 错误展示 module：控制台留痕 + 至多一次 toast。
 * 若 HTTP adapter 已 markPresented，只留痕不再弹窗（避免双 toast）。
 */
export const reportError = (
  context: string,
  error: unknown,
  fallback?: string,
): void => {
  console.error(`[${context}]`, error);
  if (isPresentedError(error)) {
    return;
  }
  showErrorToast(getUserFacingErrorMessage(error, fallback));
  if (error instanceof ApiError) {
    error.markPresented();
  }
};

/** adapter / session 路径：toast 一次并标记已展示 */
export function presentError(
  error: ApiError,
  options?: { kind?: 'error' | 'warning'; message?: string },
): ApiError {
  if (error.presented) {
    return error;
  }
  const message = options?.message || error.message;
  if (options?.kind === 'warning') {
    showWarningToast(message);
  } else {
    showErrorToast(message);
  }
  return error.markPresented();
}
