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
    </MemoryRouter>,
  );

const baseActivity: ActivityInfo = {
  id: 1,
  title: '宠物摄影大赛',
  description: '记录萌宠的精彩瞬间',
  type: ActivityType.VOTING,
  cover: 'https://example.com/cover.jpg',
  startTime: new Date(Date.now() - 86400000).toISOString(),
  endTime: new Date(Date.now() + 86400000).toISOString(),
  participantsCount: 10,
  submissionsCount: 0,
  maxParticipants: 100,
  status: ActivityStatus.PUBLISHED,
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2024-06-01T10:00:00Z',
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
    expect(screen.getByText('投票评选')).toBeInTheDocument();
  });

  it('显示活动状态：进行中', () => {
    renderWithProviders(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('显示活动状态：草稿', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, status: ActivityStatus.DRAFT }} />);
    expect(screen.getByText('草稿')).toBeInTheDocument();
  });

  it('显示活动状态：已结束', () => {
    renderWithProviders(
      <ActivityCard
        activity={{
          ...baseActivity,
          startTime: new Date(Date.now() - 172800000).toISOString(),
          endTime: new Date(Date.now() - 86400000).toISOString(),
        }}
      />,
    );
    expect(screen.getByText('已结束')).toBeInTheDocument();
  });

  it('显示参与人数', () => {
    renderWithProviders(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('10/100 人')).toBeInTheDocument();
  });

  it('已报名显示已报名标识', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, isRegistered: true }} />);
    expect(screen.getByText(/已报名/)).toBeInTheDocument();
  });

  it('点击跳转到详情页', () => {
    renderWithProviders(<ActivityCard activity={baseActivity} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/activities/1');
  });

  it('显示不同活动类型：作品征集', () => {
    renderWithProviders(<ActivityCard activity={{ ...baseActivity, type: ActivityType.CONTEST }} />);
    expect(screen.getByText('作品征集')).toBeInTheDocument();
  });
});
