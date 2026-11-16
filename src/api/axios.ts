// front/src/api/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from '../utils/toastManager';
import {
  clearAdminAuth,
  getAdminToken,
  getRefreshToken,
  getUserToken,
  isAdminApiUrl,
  isAuthEndpointUrl,
} from '../utils/authStorage';
import {
  applyUserAuth,
  clearUserSession,
  isSessionExpiredCode,
} from '../utils/session';
import { ApiError } from '../utils/error';
import { presentError } from '../utils/errorReport';

export { ApiError };

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
  clearUserSession();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
};

function rejectApiError(
  code: number,
  message: string,
  data: unknown,
  httpStatus?: number,
  options?: { present?: boolean; kind?: 'error' | 'warning' },
): Promise<never> {
  const err = new ApiError(code, message, data, httpStatus);
  if (options?.present !== false) {
    presentError(err, { kind: options?.kind, message });
  }
  return Promise.reject(err);
}

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
      const httpStatus = response.status;

      // 成功响应
      if (code === 0 || code === undefined) {
        return data;
      }

      // 业务错误：映射 body.code，经错误展示 module toast 一次
      return rejectMappedBusinessError(code, message, data, httpStatus, response.config?.url);
    },
    async (error) => {
      const originalRequest = error.config;
      const requestUrl = originalRequest?.url as string | undefined;
      const isAdminApi = isAdminApiUrl(requestUrl);
      const isAuthEndpoint = isAuthEndpointUrl(requestUrl);

      if (error.response) {
        const { status, data } = error.response;
        const bodyCode = typeof data?.code === 'number' ? data.code : status;
        const message = data?.message || '请求失败';
        const payload = data?.data ?? null;

        // 登录/验证码/刷新本身的 401：只提示，绝不清会话、不递归 refresh
        if (status === 401 && isAuthEndpoint) {
          return rejectApiError(bodyCode, message || '认证失败', payload, status);
        }

        // 管理端 401：只清管理端，绝不走用户 refresh
        if (status === 401 && isAdminApi) {
          presentError(new ApiError(bodyCode, '登录已过期，请重新登录', null, status), {
            kind: 'warning',
            message: '登录已过期，请重新登录',
          });
          expireAuth(true);
          return Promise.reject(new ApiError(bodyCode, message || '登录已过期', null, status).markPresented());
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
            presentError(new ApiError(bodyCode, '登录已过期，请重新登录', null, status), {
              kind: 'warning',
              message: '登录已过期，请重新登录',
            });
            expireAuth(false);
            isRefreshing = false;
            return Promise.reject(
              new ApiError(bodyCode, message || '登录已过期', null, status).markPresented(),
            );
          }

          try {
            // 拦截器已解包 data，此处即 { token, refreshToken }
            const refreshResponse = (await instance.post('/api/v1/auth/refresh-token', {
              refreshToken,
            })) as { token?: string; refreshToken?: string };
            const token = refreshResponse?.token;
            const newRefreshToken = refreshResponse?.refreshToken;

            if (!token) {
              throw new Error('refresh token response missing access token');
            }

            // 沿用用户端登录时的「记住我」存储偏好；经 session 广播以同步 store / WS
            applyUserAuth(token, newRefreshToken ?? refreshToken);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            processQueue(token);

            return instance(originalRequest);
          } catch (refreshError) {
            processQueue('', refreshError);
            presentError(new ApiError(401, '登录已过期，请重新登录', null, 401), {
              kind: 'warning',
              message: '登录已过期，请重新登录',
            });
            expireAuth(false);
            return Promise.reject(new ApiError(401, '登录已过期', null, 401).markPresented());
          } finally {
            isRefreshing = false;
          }
        }

        return rejectMappedHttpError(status, bodyCode, message, payload, requestUrl);
      }

      if (error.code === 'ECONNABORTED') {
        return rejectApiError(408, '请求超时，请稍后重试', null, 408);
      }

      return rejectApiError(500, '网络错误，请检查网络连接', null, 0);
    },
  );

  return instance;
};

function rejectMappedBusinessError(
  code: number,
  message: string,
  data: unknown,
  httpStatus: number,
  url?: string,
): Promise<never> {
  if (isSessionExpiredCode(code)) {
    if (isAuthEndpointUrl(url)) {
      return rejectApiError(code, message || '认证失败', data, httpStatus);
    }
    presentError(new ApiError(code, '登录已过期，请重新登录', data, httpStatus), {
      kind: 'warning',
      message: '登录已过期，请重新登录',
    });
    expireAuth(isAdminApiUrl(url));
    return Promise.reject(new ApiError(code, message || '认证失败', data, httpStatus).markPresented());
  }

  let userMessage = message || `操作失败 (错误码: ${code})`;
  let kind: 'error' | 'warning' = 'error';
  switch (code) {
    case 403:
      userMessage = '没有权限执行此操作';
      break;
    case 404:
      userMessage = '请求的资源不存在';
      kind = 'warning';
      break;
    case 400:
      userMessage = message || '请求参数错误';
      break;
    default:
      break;
  }
  return rejectApiError(code, userMessage, data, httpStatus, { kind });
}

function rejectMappedHttpError(
  status: number,
  bodyCode: number,
  message: string,
  data: unknown,
  url?: string,
): Promise<never> {
  if (isSessionExpiredCode(bodyCode) || isSessionExpiredCode(status)) {
    if (isAuthEndpointUrl(url)) {
      return rejectApiError(bodyCode, message || '认证失败', data, status);
    }
    presentError(new ApiError(bodyCode, '登录已过期，请重新登录', data, status), {
      kind: 'warning',
      message: '登录已过期，请重新登录',
    });
    expireAuth(isAdminApiUrl(url));
    return Promise.reject(new ApiError(bodyCode, message || '认证失败', data, status).markPresented());
  }

  let userMessage = message || `请求失败 (HTTP ${status})`;
  let kind: 'error' | 'warning' = 'error';
  switch (status) {
    case 403:
      userMessage = '没有权限访问此资源';
      break;
    case 404:
      userMessage = '请求的资源不存在';
      kind = 'warning';
      break;
    case 429:
      userMessage = '请求过于频繁，请稍后再试';
      kind = 'warning';
      break;
    case 500:
      userMessage = '服务器错误，请稍后重试';
      break;
    default:
      break;
  }
  return rejectApiError(bodyCode, userMessage, data, status, { kind });
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
