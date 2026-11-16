// front/src/utils/error.ts

/**
 * 领域错误 interface：HTTP adapter 与 hooks 共用。
 * presented=true 表示错误展示 module 已 toast，catch 侧不得再弹。
 */
export class ApiError extends Error {
  presented = false;

  constructor(
    public code: number,
    message: string,
    public data: unknown = null,
    public httpStatus?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  markPresented(): this {
    this.presented = true;
    return this;
  }
}

/** 兼容旧名；data 即原先的 details */
export class AppError extends ApiError {
  constructor(code: number, message: string, details?: unknown) {
    super(code, message, details);
    this.name = 'AppError';
  }

  get details(): unknown {
    return this.data;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isPresentedError(error: unknown): boolean {
  return isApiError(error) && error.presented;
}

export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  if (isApiError(error)) {
    return error.code === 408 || error.message === '网络错误' || error.message === '请求超时';
  }
  if (error instanceof Error) {
    return (
      error.message === 'Network error' ||
      error.message === 'Request timeout' ||
      error.message === '网络错误' ||
      error.message === '请求超时'
    );
  }
  return false;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};
