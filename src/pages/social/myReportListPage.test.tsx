import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/toast';
import type { ReportInfo } from '../../types/post';

const getReportListMock = vi.fn();
const getReportDetailMock = vi.fn();

vi.mock('../../api/post', () => ({
  getReportList: (...args: unknown[]) => getReportListMock(...args),
  getReportDetail: (...args: unknown[]) => getReportDetailMock(...args),
}));

import { MyReportListPage } from './myReportListPage';

const report: ReportInfo = {
  id: 7,
  reporterId: 1,
  targetType: 'post',
  targetId: 42,
  reason: '重复发布广告',
  reasonType: 'spam',
  status: 1,
  handleResult: '已删除内容',
  createdAt: '2026-11-06T09:30:00Z',
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <MyReportListPage />
      </ToastProvider>
    </MemoryRouter>,
  );

describe('MyReportListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getReportListMock.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 10 });
    getReportDetailMock.mockResolvedValue({ ...report, handledAt: '2026-11-06T12:00:00Z' });
  });

  it('空列表显示空态', async () => {
    renderPage();
    expect(await screen.findByText('暂无举报记录')).toBeTruthy();
    expect(getReportListMock).toHaveBeenCalledWith(1, 10);
  });

  it('渲染举报内容与处理结果', async () => {
    getReportListMock.mockResolvedValue({ list: [report], total: 1, page: 1, pageSize: 10 });
    renderPage();
    expect(await screen.findByText('动态 #42')).toBeTruthy();
    expect(screen.getByText(/垃圾广告/)).toBeTruthy();
    expect(screen.getByText(/已删除内容/)).toBeTruthy();
    expect(screen.getByText('已处理')).toBeTruthy();
  });

  it('展开详情显示处理结果与处理时间', async () => {
    getReportListMock.mockResolvedValue({ list: [report], total: 1, page: 1, pageSize: 10 });
    renderPage();
    await screen.findByText('动态 #42');
    fireEvent.click(screen.getByRole('button', { name: '查看详情' }));
    await waitFor(() => expect(getReportDetailMock).toHaveBeenCalledWith(7));
    expect(await screen.findByText(/处理时间：/)).toBeTruthy();
    expect(screen.getAllByText(/处理结果：/).length).toBeGreaterThan(1);
  });

  it('翻页时按新页码重新请求', async () => {
    getReportListMock.mockResolvedValue({ list: [report], total: 25, page: 1, pageSize: 10 });
    renderPage();
    await screen.findByText('动态 #42');
    fireEvent.click(screen.getByRole('button', { name: '下一页' }));
    await waitFor(() => expect(getReportListMock).toHaveBeenCalledWith(2, 10));
  });
});
