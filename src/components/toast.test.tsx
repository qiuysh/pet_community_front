import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from './toast';
import { clearAppToasts, showAppToast, closeAppToast } from './ui/toast';

const TestComponent = () => {
  const toast = useToast();
  return (
    <div>
      <button type="button" onClick={() => toast.success('操作成功')}>显示成功</button>
      <button type="button" onClick={() => toast.error('操作失败')}>显示错误</button>
      <button type="button" onClick={() => toast.info('提示信息')}>显示信息</button>
      <button type="button" onClick={() => toast.warning('警告信息')}>显示警告</button>
    </div>
  );
};

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    clearAppToasts();
  });

  afterEach(() => {
    clearAppToasts();
    vi.useRealTimers();
  });

  it('成功触发 toast 后应渲染成功提示', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /显示成功/i }));

    await waitFor(() => {
      expect(screen.getAllByText('操作成功').length).toBeGreaterThan(0);
    });
  });

  it('错误触发 toast 后应渲染错误提示', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /显示错误/i }));

    await waitFor(() => {
      expect(screen.getAllByText('操作失败').length).toBeGreaterThan(0);
    });
  });

  it('多个 toast 应同时显示', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /显示成功/i }));
    fireEvent.click(screen.getByRole('button', { name: /显示信息/i }));

    await waitFor(() => {
      expect(screen.getAllByText('操作成功').length).toBeGreaterThan(0);
      expect(screen.getAllByText('提示信息').length).toBeGreaterThan(0);
    });
  });

  it('closeAppToast 应关闭对应 toast', async () => {
    render(
      <ToastProvider>
        <div />
      </ToastProvider>
    );

    let id = '';
    act(() => {
      id = showAppToast('success', '可关闭提示', 3000);
    });

    await waitFor(() => {
      expect(screen.getAllByText('可关闭提示').length).toBeGreaterThan(0);
    });

    act(() => {
      closeAppToast(id);
    });

    await waitFor(() => {
      expect(screen.queryAllByText('可关闭提示')).toHaveLength(0);
    });
  });

  it('useToast 在 Provider 外部使用应抛出错误', () => {
    expect(() => renderHook(() => useToast())).toThrow('useToast must be used within a ToastProvider');
  });
});
