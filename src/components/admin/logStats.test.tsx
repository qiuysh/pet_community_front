import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/admin', () => ({
  getLogStats: vi.fn(),
}));

import { getLogStats } from '../../api/admin';
import { LogStats } from './logStats';
import { LogStatsResponse } from '../../types/admin';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

const baseStats: LogStatsResponse = {
  totalCount: 100,
  todayCount: 10,
  actionStats: {
    login: 50,
    post_create: 30,
    like: 20,
  },
  dailyStats: [
    { date: '2024-06-01', count: 10 },
    { date: '2024-06-02', count: 20 },
    { date: '2024-06-03', count: 15 },
  ],
};

describe('LogStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('加载中显示骨架屏', () => {
    vi.mocked(getLogStats).mockImplementation(() => new Promise(() => {}));
    const { container } = renderWithToast(
      <LogStats userId="" actionType="" startTime="" endTime="" />
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('成功获取后渲染统计卡片', async () => {
    vi.mocked(getLogStats).mockResolvedValue(baseStats);
    renderWithToast(
      <LogStats userId="" actionType="" startTime="" endTime="" />
    );
    await waitFor(() => {
      expect(screen.getByText('日志统计')).toBeInTheDocument();
      expect(screen.getByText('总日志数')).toBeInTheDocument();
      expect(screen.getByText('今日日志')).toBeInTheDocument();
      expect(screen.getByText('操作类型')).toBeInTheDocument();
      expect(screen.getByText('统计天数')).toBeInTheDocument();
    });
  });

  it('显示近7天标识', async () => {
    vi.mocked(getLogStats).mockResolvedValue(baseStats);
    renderWithToast(
      <LogStats userId="" actionType="" startTime="" endTime="" />
    );
    await waitFor(() => {
      expect(screen.getByText('近7天')).toBeInTheDocument();
    });
  });

  it('渲染操作类型分布', async () => {
    vi.mocked(getLogStats).mockResolvedValue(baseStats);
    renderWithToast(
      <LogStats userId="" actionType="" startTime="" endTime="" />
    );
    await waitFor(() => {
      expect(screen.getByText('操作类型分布')).toBeInTheDocument();
      expect(screen.getByText('登录')).toBeInTheDocument();
      expect(screen.getByText('发布帖子')).toBeInTheDocument();
    });
  });

  it('渲染近7天趋势', async () => {
    vi.mocked(getLogStats).mockResolvedValue(baseStats);
    renderWithToast(
      <LogStats userId="" actionType="" startTime="" endTime="" />
    );
    await waitFor(() => {
      expect(screen.getByText('近7天日志趋势')).toBeInTheDocument();
    });
  });

  it('调用 API 时携带参数', async () => {
    vi.mocked(getLogStats).mockResolvedValue(baseStats);
    renderWithToast(
      <LogStats userId="123" actionType="login" startTime="2024-06-01" endTime="2024-06-30" />
    );
    await waitFor(() => {
      expect(getLogStats).toHaveBeenCalledWith({
        userId: 123,
        actionType: 'login',
        startTime: '2024-06-01',
        endTime: '2024-06-30',
        days: 7,
      });
    });
  });

  it('空 userId 不发送参数', async () => {
    vi.mocked(getLogStats).mockResolvedValue(baseStats);
    renderWithToast(
      <LogStats userId="" actionType="" startTime="" endTime="" />
    );
    await waitFor(() => {
      expect(getLogStats).toHaveBeenCalledWith({
        userId: undefined,
        actionType: undefined,
        startTime: undefined,
        endTime: undefined,
        days: 7,
      });
    });
  });

  it('未知操作类型使用原值', async () => {
    vi.mocked(getLogStats).mockResolvedValue({
      ...baseStats,
      actionStats: { unknown_type: 5 } as any,
    });
    renderWithToast(
      <LogStats userId="" actionType="" startTime="" endTime="" />
    );
    await waitFor(() => {
      expect(screen.getByText('unknown_type')).toBeInTheDocument();
    });
  });

  it('获取失败显示错误', async () => {
    vi.mocked(getLogStats).mockRejectedValue(new Error('error'));
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithToast(
      <LogStats userId="" actionType="" startTime="" endTime="" />
    );
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });
});
