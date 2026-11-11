import { getErrorMessage } from './error';
import { showErrorToast } from './toastManager';

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
 * 失败上报：控制台留痕 + 用户可见提示。
 * 用于替代「catch 里只 console.error」的静默失败——否则用户看到的是空态，
 * 分不清「没有数据」还是「接口挂了」。
 */
export const reportError = (
  context: string,
  error: unknown,
  fallback?: string,
): void => {
  console.error(`[${context}]`, error);
  showErrorToast(getUserFacingErrorMessage(error, fallback));
};
