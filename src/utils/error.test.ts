import { describe, it, expect } from 'vitest';
import { AppError, handleError, isNetworkError, getErrorMessage } from './error';

describe('error', () => {
  describe('AppError', () => {
    it('应保存错误码和消息', () => {
      const error = new AppError(400, '参数错误');
      expect(error.code).toBe(400);
      expect(error.message).toBe('参数错误');
      expect(error.name).toBe('AppError');
    });

    it('应支持附加详情', () => {
      const error = new AppError(422, '校验失败', { field: 'name' });
      expect(error.details).toEqual({ field: 'name' });
    });
  });

  describe('handleError', () => {
    it('AppError 应返回其消息', () => {
      expect(handleError(new AppError(400, '参数错误'))).toBe('参数错误');
    });

    it('普通 Error 应返回其消息', () => {
      expect(handleError(new Error('网络异常'))).toBe('网络异常');
    });

    it('非 Error 值应返回默认提示', () => {
      expect(handleError(null)).toBe('An unexpected error occurred');
    });
  });

  describe('isNetworkError', () => {
    it('网络错误消息应返回 true', () => {
      expect(isNetworkError(new Error('Network error'))).toBe(true);
      expect(isNetworkError(new Error('Request timeout'))).toBe(true);
    });

    it('其他错误应返回 false', () => {
      expect(isNetworkError(new Error('参数错误'))).toBe(false);
      expect(isNetworkError('Network error')).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('AppError 应返回其消息', () => {
      expect(getErrorMessage(new AppError(403, '无权限'))).toBe('无权限');
    });

    it('普通 Error 应返回其消息', () => {
      expect(getErrorMessage(new Error('请求失败'))).toBe('请求失败');
    });

    it('字符串应直接返回', () => {
      expect(getErrorMessage('直接错误信息')).toBe('直接错误信息');
    });

    it('其他类型应返回默认提示', () => {
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
    });
  });
});
