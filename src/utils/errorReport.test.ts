import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUserFacingErrorMessage, reportError } from './errorReport';
import { registerToastCallback, unregisterToastCallback } from './toastManager';
import { AppError } from './error';

describe('getUserFacingErrorMessage', () => {
  it('优先返回异常自带消息', () => {
    expect(getUserFacingErrorMessage(new Error('图片大小不得超过 5MB'))).toBe('图片大小不得超过 5MB');
  });

  it('AppError 返回其 code 对应的消息', () => {
    expect(getUserFacingErrorMessage(new AppError(400, '无权删除'))).toBe('无权删除');
  });

  it('未知错误回落到中文兜底，而不是英文默认文案', () => {
    expect(getUserFacingErrorMessage({})).toBe('操作失败，请稍后重试');
    expect(getUserFacingErrorMessage(null, '加载失败')).toBe('加载失败');
  });
});

describe('reportError', () => {
  const toast = vi.fn();

  beforeEach(() => {
    registerToastCallback(toast);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    unregisterToastCallback();
    vi.restoreAllMocks();
    toast.mockReset();
  });

  it('同时写控制台并弹出用户可见的错误提示', () => {
    reportError('获取消息列表失败', new Error('Network error'));

    expect(console.error).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('error', 'Network error', undefined);
  });

  it('异常没有消息时使用兜底文案', () => {
    reportError('获取列表失败', {});

    expect(toast).toHaveBeenCalledWith('error', '操作失败，请稍后重试', undefined);
  });
});
