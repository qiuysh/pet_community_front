import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ActivityCard } from './activityCard';
import { ActivityInfo, ActivityStatus, ActivityType } from '../../types/activity';
import { ToastProvider } from '../toast';

const renderWithProviders = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <ToastProvider>{ui}</ToastProvider>
    </MemoryRouter>
  );

const baseActivity: ActivityInfo = {
  id: 1,
  title: '宠物摄影大赛',
  description: '记录萌宠的精彩瞬间',
  type: ActivityType.ONLINE_VOTE,
  cover: 'https://example.com/cover.jpg',
  startTime: '2024-06-15 10:00:00',
  endTime: '2024-06-20 18:00:00',
  currentParticipants: 10,
  maxParticipants: 100,
  status: ActivityStatus.ONGOING,
  organizerId: 1,
  organizerName: '活动方',
  organizerAvatar: '',
  createdAt: '2024-06-01 10:00:00',
  updatedAt: '2024-06-01 10:00:00',
  isRegistered: false,
};

describe('ActivityCard', () => {
  it('渲染活动标题和描述', () => {
    renderWithProviders(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('宠物摄影大赛')).toBeInTheDocument();
    expect(screen.getByText('记录萌宠的精彩瞬间')).toBeInTheDocument();
  });

  it('显示活动类型', () => {
    renderWithProviders(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('线上投票')).toBeInTheDocument();
  });

  it('显示活动状态：进行中', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, status: ActivityStatus.ONGOING }} />);
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('显示活动状态：草稿', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, status: ActivityStatus.DRAFT }} />);
    expect(screen.getByText('草稿')).toBeInTheDocument();
  });

  it('显示活动状态：已发布', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, status: ActivityStatus.PUBLISHED }} />);
    expect(screen.getByText('已发布')).toBeInTheDocument();
  });

  it('显示活动状态：已结束', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, status: ActivityStatus.ENDED }} />);
    expect(screen.getByText('已结束')).toBeInTheDocument();
  });

  it('显示活动状态：已取消', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, status: ActivityStatus.CANCELLED }} />);
    expect(screen.getByText('已取消')).toBeInTheDocument();
  });

  it('显示参与人数', () => {
    renderWithProviders(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('10/100 人')).toBeInTheDocument();
  });

  it('已报名显示已报名标识', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, isRegistered: true }} />);
    expect(screen.getByText(/已报名/)).toBeInTheDocument();
  });

  it('未报名不显示已报名标识', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, isRegistered: false }} />);
    expect(screen.queryByText(/已报名/)).not.toBeInTheDocument();
  });

  it('点击跳转到详情页', () => {
    renderWithProviders(<ActivityCard activity={baseActivity} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/activities/1');
  });

  it('使用默认封面当 cover 为空', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, cover: '' }} />);
    const img = screen.getByAltText('宠物摄影大赛');
    expect(img).toHaveAttribute('src', '/default-activity-cover.png');
  });

  it('显示不同活动类型：线下活动', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, type: ActivityType.OFFLINE_EVENT }} />);
    expect(screen.getByText('线下活动')).toBeInTheDocument();
  });

  it('显示不同活动类型：领养活动', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, type: ActivityType.ADOPTION }} />);
    expect(screen.getByText('领养活动')).toBeInTheDocument();
  });

  it('无 maxParticipants 时不显示人数比例', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, maxParticipants: undefined }} />);
    expect(screen.queryByText(/\/100/)).not.toBeInTheDocument();
  });
});
