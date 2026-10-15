// front/src/types/common.ts

// 响应数据基础类型
export interface IResponse<T = any> {
    code: number;
    message: string;
    data?: T;
    errors?: any;
}

// 分页数据
export interface IPagination<T = any> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
}

// 分页响应
export interface IPaginationResponse<T = any> extends IResponse<IPagination<T>> {}

// 请求配置
export interface IRequestConfig {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    params?: Record<string, any>;
    data?: Record<string, any>;
    headers?: Record<string, string>;
}

// 错误码枚举
export enum ErrorCode {
    Success = 0,
    ParamError = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    ServerError = 500,
    BusinessError = 1000,
}