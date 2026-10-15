import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/admin', () => ({
  getAdStats: vi.fn(),
}));

import { getAdStats } from '../../api/admin';
import { AdStats } from './adStats';
import { AdStatsResponse } from '../../types/advertisement';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

const baseStats: AdStatsResponse = {
  totalViews: 1000,
  totalClicks: 50,
  ctr: 5.0,
  statsByDay: [
    { label: '2024-06-01', value: 300 },
    { label: '2024-06-02', value: 500 },
  ],
  statsByPosition: [
    { label: '顶部横幅', value: 800 },
    { label: '侧边栏', value: 200 },
  ],
};

describe('AdStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('加载中状态', () => {
    vi.mocked(getAdStats).mockImplementation(() => new Promise(() => {}));
    renderWithToast(<AdStats />);
    expect(screen.getByText('加载中…')).toBeInTheDocument();
  });

  it('成功获取统计后渲染数据', async () => {
    vi.mocked(getAdStats).mockResolvedValue(baseStats);
    renderWithToast(<AdStats />);
    await waitFor(() => {
      expect(screen.getByText('广告统计')).toBeInTheDocument();
    });
    expect(screen.getByText('总展示量')).toBeInTheDocument();
    expect(screen.getByText('总点击量')).toBeInTheDocument();
    expect(screen.getByText('点击率 (CTR)')).toBeInTheDocument();
  });

  it('格式化大数字', async () => {
    vi.mocked(getAdStats).mockResolvedValue({
      ...baseStats,
      totalViews: 1234567,
    });
    renderWithToast(<AdStats />);
    await waitFor(() => {
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });
  });

  it('格式化点击率保留两位小数', async () => {
    vi.mocked(getAdStats).mockResolvedValue({ ...baseStats, ctr: 3.456 });
    renderWithToast(<AdStats />);
    await waitFor(() => {
      expect(screen.getByText('3.46%')).toBeInTheDocument();
    });
  });

  it('渲染按日期统计', async () => {
    vi.mocked(getAdStats).mockResolvedValue(baseStats);
    renderWithToast(<AdStats />);
    await waitFor(() => {
      expect(screen.getByText('按日期统计')).toBeInTheDocument();
      expect(screen.getByText('2024-06-01')).toBeInTheDocument();
      expect(screen.getByText('2024-06-02')).toBeInTheDocument();
    });
  });

  it('渲染按广告位统计', async () => {
    vi.mocked(getAdStats).mockResolvedValue(baseStats);
    renderWithToast(<AdStats />);
    await waitFor(() => {
      expect(screen.getByText('按广告位统计')).toBeInTheDocument();
      expect(screen.getByText('顶部横幅')).toBeInTheDocument();
    });
  });

  it('空数据时显示提示', async () => {
    vi.mocked(getAdStats).mockResolvedValue({
      totalViews: 0,
      totalClicks: 0,
      ctr: 0,
      statsByDay: [],
      statsByPosition: [],
    });
    renderWithToast(<AdStats />);
    await waitFor(() => {
      expect(screen.getByText('暂无日期统计数据')).toBeInTheDocument();
      expect(screen.getByText('暂无广告位统计数据')).toBeInTheDocument();
    });
  });

  it('调用 API 时携带日期参数', async () => {
    vi.mocked(getAdStats).mockResolvedValue(baseStats);
    renderWithToast(<AdStats startDate="2024-06-01" endDate="2024-06-30" />);
    await waitFor(() => {
      expect(getAdStats).toHaveBeenCalledWith({
        startDate: '2024-06-01',
        endDate: '2024-06-30',
      });
    });
  });

  it('获取失败显示错误', async () => {
    vi.mocked(getAdStats).mockRejectedValue(new Error('获取失败'));
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithToast(<AdStats />);
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('获取失败'));
    });
    errorSpy.mockRestore();
  });
});
