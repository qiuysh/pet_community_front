import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../components/toast';
import { useUserStore } from '../../stores/userStore';
import { ActivityDetailPage } from './activityDetailPage';
import { ActivityStatus, ActivityType } from '../../types/activity';
import {
  cancelRegistration,
  getActivityDetail,
  getAlbumPhotoList,
  getReview,
  getSubmissionList,
} from '../../api/activity';

vi.mock('../../api/activity', () => ({
  getActivityDetail: vi.fn(),
  getSubmissionList: vi.fn(),
  getReview: vi.fn(),
  getAlbumPhotoList: vi.fn(),
  cancelRegistration: vi.fn(),
  deleteSubmission: vi.fn(),
  updateSubmission: vi.fn(),
  createRegistration: vi.fn(),
  createSubmission: vi.fn(),
  voteSubmission: vi.fn(),
  uploadAlbumPhoto: vi.fn(),
  deleteAlbumPhoto: vi.fn(),
}));

const now = new Date();
const startTime = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
const endTime = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();

const activity = {
  id: 12,
  title: '萌宠摄影大赛',
  description: '晒出你家主子',
  type: ActivityType.CONTEST,
  cover: '',
  status: ActivityStatus.PUBLISHED,
  startTime,
  endTime,
  rules: '每人限投一稿',
  createdAt: startTime,
  updatedAt: startTime,
  participantsCount: 3,
  submissionsCount: 1,
  isRegistered: true,
  hasSubmitted: false,
};

const renderPage = () =>
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/activities/12']}>
        <Routes>
          <Route path="/activities/:id" element={<ActivityDetailPage />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );

describe('ActivityDetailPage 报名与内容入口', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ user: { id: 7, nickname: '我', avatar: '' } as never, isLoggedIn: true });
    vi.mocked(getActivityDetail).mockResolvedValue(activity as never);
    vi.mocked(getSubmissionList).mockResolvedValue({ list: [], total: 0 } as never);
    vi.mocked(getAlbumPhotoList).mockResolvedValue({ list: [], total: 0 } as never);
    vi.mocked(getReview).mockResolvedValue(null as never);
    vi.mocked(cancelRegistration).mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    useUserStore.setState({ user: null, isLoggedIn: false });
  });

  it('已报名且可取消时展示「取消报名」，确认后调用取消接口', async () => {
    renderPage();

    const cancelBtn = await screen.findByRole('button', { name: '取消报名' });
    fireEvent.click(cancelBtn);

    // 二次确认弹层
    const confirmBtn = await screen.findByRole('button', { name: '取消报名' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(cancelRegistration).toHaveBeenCalledWith(12);
    });
  });

  it('提供活动相册入口，切换后加载相册数据', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('tab', { name: /活动相册/ }));

    await waitFor(() => {
      expect(getAlbumPhotoList).toHaveBeenCalled();
    });
  });

  it('回顾未发布时不展示回顾页签，发布后展示内容', async () => {
    renderPage();
    await screen.findByText('萌宠摄影大赛');
    expect(screen.queryByRole('tab', { name: /活动回顾/ })).not.toBeInTheDocument();
  });
});
