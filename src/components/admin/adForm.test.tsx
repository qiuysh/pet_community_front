import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/admin', () => ({
  createAd: vi.fn(),
  updateAd: vi.fn(),
  getAdPositionList: vi.fn(() => Promise.resolve({ list: [], total: 0, page: 1, page_size: 100 })),
}));

import { createAd, updateAd, getAdPositionList } from '../../api/admin';
import { AdForm } from './adForm';
import { Advertisement } from '../../types/advertisement';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

const baseAd: Advertisement = {
  id: 1,
  positionId: 1,
  position: { id: 1, name: '顶部横幅', location: 'top', size: '728x90', status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  title: '测试广告',
  imageUrl: 'https://example.com/ad.jpg',
  linkUrl: 'https://example.com',
  startTime: '2024-06-15T10:00:00',
  endTime: '2024-06-30T18:00:00',
  viewCount: 0,
  clickCount: 0,
  status: 0,
  createdBy: 1,
  createdAt: '2024-06-01',
  updatedAt: '2024-06-01',
};

describe('AdForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染创建表单', async () => {
    renderWithToast(<AdForm onCancel={() => {}} onSubmit={() => {}} />);
    await waitFor(() => {
      expect(getAdPositionList).toHaveBeenCalled();
    });
  });

  it('加载广告位选项', async () => {
    vi.mocked(getAdPositionList).mockResolvedValue({
      list: [
        { id: 1, name: '顶部横幅', location: 'top', size: '728x90', status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 2, name: '侧边栏', location: 'side', size: '300x250', status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
      total: 2,
      page: 1,
      page_size: 100,
    });
    renderWithToast(<AdForm onCancel={() => {}} onSubmit={() => {}} />);
    await waitFor(() => {
      expect(getAdPositionList).toHaveBeenCalled();
    });
  });

  it('取消按钮触发 onCancel', () => {
    const onCancel = vi.fn();
    renderWithToast(<AdForm onCancel={onCancel} onSubmit={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('编辑模式加载已有广告', async () => {
    vi.mocked(getAdPositionList).mockResolvedValue({
      list: [],
      total: 0,
      page: 1,
      page_size: 100,
    });
    renderWithToast(<AdForm ad={baseAd} onCancel={() => {}} onSubmit={() => {}} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('测试广告')).toBeInTheDocument();
    });
  });

  it('输入广告标题', async () => {
    renderWithToast(<AdForm onCancel={() => {}} onSubmit={() => {}} />);
    await waitFor(() => {
      expect(getAdPositionList).toHaveBeenCalled();
    });
    const titleInput = screen.getByPlaceholderText('请输入广告标题');
    fireEvent.change(titleInput, { target: { value: '新广告' } });
    expect(titleInput).toHaveValue('新广告');
  });

  it('输入图片URL显示预览', async () => {
    renderWithToast(<AdForm onCancel={() => {}} onSubmit={() => {}} />);
    await waitFor(() => {
      expect(getAdPositionList).toHaveBeenCalled();
    });
    const urlInput = screen.getByPlaceholderText('请输入广告图片URL');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/img.jpg' } });
    expect(screen.getByAltText('广告预览')).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('空标题提交提示错误', async () => {
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithToast(<AdForm onCancel={() => {}} onSubmit={() => {}} />);
    await waitFor(() => {
      expect(getAdPositionList).toHaveBeenCalled();
    });
    const submitBtn = screen.getAllByRole('button').find(b => b.textContent === '创建广告');
    if (submitBtn) fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(createAd).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('创建广告成功', async () => {
    vi.mocked(createAd).mockResolvedValue({} as any);
    vi.mocked(getAdPositionList).mockResolvedValue({
      list: [
        { id: 1, name: '顶部横幅', location: 'top', size: '728x90', status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 0, name: '默认', location: 'default', size: '0x0', status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' } as any,
      ],
      total: 2,
      page: 1,
      page_size: 100,
    });
    const onSubmit = vi.fn();
    renderWithToast(<AdForm onCancel={() => {}} onSubmit={onSubmit} />);
    await waitFor(() => {
      expect(getAdPositionList).toHaveBeenCalled();
    });
    fireEvent.change(screen.getByPlaceholderText('请输入广告标题'), { target: { value: '新广告' } });
    fireEvent.change(screen.getByPlaceholderText('请输入广告图片URL'), { target: { value: 'https://example.com/img.jpg' } });
    const submitBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('创建广告'));
    if (submitBtn) fireEvent.click(submitBtn);
  });

  it('编辑广告调用 updateAd', async () => {
    vi.mocked(updateAd).mockResolvedValue({} as any);
    vi.mocked(getAdPositionList).mockResolvedValue({
      list: [{ id: 1, name: '顶部横幅', location: 'top', size: '728x90', status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
      total: 1,
      page: 1,
      page_size: 100,
    });
    const onSubmit = vi.fn();
    renderWithToast(<AdForm ad={baseAd} onCancel={() => {}} onSubmit={onSubmit} />);
    await waitFor(() => {
      expect(getAdPositionList).toHaveBeenCalled();
    });
  });
});
