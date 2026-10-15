// front/src/api/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
} from '../utils/toastManager';
import {
  clearAdminAuth,
  clearUserAuth,
  getAdminToken,
  getRefreshToken,
  getUserToken,
  isAdminApiUrl,
  setUserAuth,
} from '../utils/authStorage';

// API 基础配置
const BASE_URL = '/';
const TIMEOUT = 30000;
const CSRF_HEADER = 'X-CSRF-Token';
const MUTATING = new Set(['post', 'put', 'patch', 'delete']);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];
let csrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** 确保 CSRF Cookie + 内存 token（双重 Cookie） */
export async function ensureCsrfToken(): Promise<string | null> {
  const fromCookie = readCsrfCookie();
  if (csrfToken && fromCookie && csrfToken === fromCookie) {
    return csrfToken;
  }
  if (fromCookie && !csrfToken) {
    csrfToken = fromCookie;
    return csrfToken;
  }
  if (!csrfPromise) {
    csrfPromise = axios
      .get<{ code?: number; data?: { csrfToken?: string }; csrfToken?: string }>(
        `${BASE_URL}api/v1/csrf-token`,
        { withCredentials: true, timeout: TIMEOUT },
      )
      .then((res) => {
        const body = res.data as {
          code?: number;
          data?: { csrfToken?: string };
          csrfToken?: string;
        };
        const token =
          body?.data?.csrfToken || body?.csrfToken || readCsrfCookie() || null;
        csrfToken = token;
        return token;
      })
      .catch(() => readCsrfCookie())
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

const processQueue = (token: string, error?: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/** 仅清理并跳转对应端，绝不影响另一端登录态 */
const expireAuth = (isAdmin: boolean) => {
  if (isAdmin) {
    clearAdminAuth();
    if (!window.location.pathname.startsWith('/admin/login')) {
      window.location.href = '/admin/login';
    }
    return;
  }
  clearUserAuth();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
};

// 创建 axios 实例
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器 - Token + CSRF
  instance.interceptors.request.use(
    async (config) => {
      const isAdminApi = isAdminApiUrl(config.url);
      const token = isAdminApi ? getAdminToken() : getUserToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const method = (config.method || 'get').toLowerCase();
      const url = config.url || '';
      const needsCsrf =
        MUTATING.has(method) &&
        !url.includes('/csrf-token') &&
        !url.includes('/public-key');
      if (needsCsrf) {
        const csrf = await ensureCsrfToken();
        if (csrf) {
          config.headers[CSRF_HEADER] = csrf;
        }
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // 响应拦截器 - 统一处理
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const { code, message, data } = response.data;

      // 成功响应
      if (code === 0 || code === undefined) {
        return data;
      }

      // 业务错误处理 - 使用Toast显示
      handleBusinessError(code, message, response.config?.url);
      return Promise.reject(new ApiError(code, message, data));
    },
    async (error) => {
      const originalRequest = error.config;
      const isAdminApi = isAdminApiUrl(originalRequest?.url);

      if (error.response) {
        const { status, data } = error.response;

        // 管理端 401：只清管理端，绝不走用户 refresh
        if (status === 401 && isAdminApi) {
          showWarningToast('登录已过期，请重新登录');
          expireAuth(true);
          return Promise.reject(new ApiError(status, data?.message || '登录已过期', null));
        }

        // 用户端 401：尝试 refreshToken，失败只清用户端
        if (status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            showWarningToast('登录已过期，请重新登录');
            expireAuth(false);
            isRefreshing = false;
            return Promise.reject(new ApiError(status, data?.message || '登录已过期', null));
          }

          try {
            const refreshResponse = await instance.post('/api/v1/auth/refresh-token', { refreshToken });
            const { token, refreshToken: newRefreshToken } = refreshResponse.data;

            // 沿用用户端登录时的「记住我」存储偏好
            setUserAuth(token, newRefreshToken ?? refreshToken);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            processQueue(token);

            return instance(originalRequest);
          } catch (refreshError) {
            processQueue('', refreshError);
            showWarningToast('登录已过期，请重新登录');
            expireAuth(false);
            return Promise.reject(new ApiError(401, '登录已过期', null));
          } finally {
            isRefreshing = false;
          }
        }

        handleHttpError(status, data?.message || 'Network error', originalRequest?.url);
        return Promise.reject(new ApiError(status, data?.message || 'Network error', null));
      }

      if (error.code === 'ECONNABORTED') {
        showErrorToast('请求超时，请稍后重试');
        return Promise.reject(new ApiError(408, '请求超时', null));
      }

      showErrorToast('网络错误，请检查网络连接');
      return Promise.reject(new ApiError(500, '网络错误', null));
    },
  );

  return instance;
};

// 业务错误处理 - 使用Toast显示
const handleBusinessError = (code: number, message: string, url?: string): void => {
  switch (code) {
    case 401:
      if (message.toLowerCase().includes('token')) {
        showWarningToast('登录已过期，请重新登录');
        expireAuth(isAdminApiUrl(url));
      } else {
        showErrorToast(message || '认证失败');
      }
      break;
    case 403:
      showErrorToast('没有权限执行此操作');
      break;
    case 404:
      showWarningToast('请求的资源不存在');
      break;
    case 400:
      showErrorToast(message || '请求参数错误');
      break;
    default:
      showErrorToast(message || `操作失败 (错误码: ${code})`);
  }
};

// HTTP 错误处理 - 使用Toast显示
const handleHttpError = (status: number, message: string, url?: string): void => {
  switch (status) {
    case 401:
      if (message.toLowerCase().includes('token')) {
        showWarningToast('登录已过期，请重新登录');
        expireAuth(isAdminApiUrl(url));
      } else {
        showErrorToast(message || '认证失败');
      }
      break;
    case 403:
      showErrorToast('没有权限访问此资源');
      break;
    case 404:
      showWarningToast('请求的资源不存在');
      break;
    case 429:
      showWarningToast('请求过于频繁，请稍后再试');
      break;
    case 500:
      showErrorToast('服务器错误，请稍后重试');
      break;
    default:
      showErrorToast(message || `请求失败 (HTTP ${status})`);
  }
};

// API 错误类
export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public data: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 导出 API 实例
export const api = createApiInstance();

// 导出请求方法（拦截器已解包 data，断言为业务类型）
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  api.get(url, config) as Promise<T>;

export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
  api.post(url, data, config) as Promise<T>;

export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
  api.put(url, data, config) as Promise<T>;

export const patch = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
  api.patch(url, data, config) as Promise<T>;

export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  api.delete(url, config) as Promise<T>;

// 导出toast方法供其他地方使用
export { showSuccessToast, showErrorToast, showWarningToast, showInfoToast };
