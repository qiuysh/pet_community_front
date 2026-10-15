import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AwardResultDisplay } from './AwardResultDisplay';
import { SubmissionInfo, SubmissionStatus } from '../../types/activity';

const baseSubmission: SubmissionInfo = {
  id: 1,
  activityId: 1,
  userId: 100,
  userNickname: '作者A',
  userAvatar: '',
  title: '作品A',
  description: '作品描述',
  images: ['https://example.com/a.jpg'],
  votesCount: 100,
  isAwarded: true,
  status: SubmissionStatus.APPROVED,
  createdAt: '2024-06-01 10:00:00',
  updatedAt: '2024-06-01 10:00:00',
};

describe('AwardResultDisplay', () => {
  it('无获奖作品时显示空状态', () => {
    render(<AwardResultDisplay />);
    expect(screen.getByText('获奖结果')).toBeInTheDocument();
    expect(screen.getByText('暂未设置获奖作品')).toBeInTheDocument();
  });

  it('空数组时显示空状态', () => {
    render(<AwardResultDisplay secondPrizes={[]} thirdPrizes={[]} />);
    expect(screen.getByText('暂未设置获奖作品')).toBeInTheDocument();
  });

  it('显示一等奖', () => {
    render(<AwardResultDisplay firstPrize={baseSubmission} />);
    expect(screen.getByText('一等奖')).toBeInTheDocument();
    expect(screen.getByText('作品A')).toBeInTheDocument();
    expect(screen.getByText(/作者: 作者A/)).toBeInTheDocument();
    expect(screen.getByText('100 票')).toBeInTheDocument();
  });

  it('显示一等奖图片', () => {
    render(<AwardResultDisplay firstPrize={baseSubmission} />);
    const img = screen.getByAltText('作品A');
    expect(img).toHaveAttribute('src', 'https://example.com/a.jpg');
  });

  it('一等奖无图片时不渲染图片', () => {
    render(
      <AwardResultDisplay
        firstPrize={{ ...baseSubmission, images: [] }}
      />
    );
    expect(screen.queryByAltText('作品A')).not.toBeInTheDocument();
  });

  it('显示多个二等奖', () => {
    const secondPrizes: SubmissionInfo[] = [
      { ...baseSubmission, id: 2, title: '二等奖1', votesCount: 50 },
      { ...baseSubmission, id: 3, title: '二等奖2', votesCount: 40 },
    ];
    render(<AwardResultDisplay secondPrizes={secondPrizes} />);
    expect(screen.getByText('二等奖')).toBeInTheDocument();
    expect(screen.getByText('二等奖1')).toBeInTheDocument();
    expect(screen.getByText('二等奖2')).toBeInTheDocument();
    expect(screen.getByText('50 票')).toBeInTheDocument();
    expect(screen.getByText('40 票')).toBeInTheDocument();
  });

  it('显示多个三等奖', () => {
    const thirdPrizes: SubmissionInfo[] = [
      { ...baseSubmission, id: 4, title: '三等奖1', votesCount: 30 },
      { ...baseSubmission, id: 5, title: '三等奖2', votesCount: 20 },
    ];
    render(<AwardResultDisplay thirdPrizes={thirdPrizes} />);
    expect(screen.getByText('三等奖')).toBeInTheDocument();
    expect(screen.getByText('三等奖1')).toBeInTheDocument();
    expect(screen.getByText('三等奖2')).toBeInTheDocument();
  });

  it('显示总获奖数', () => {
    const secondPrizes: SubmissionInfo[] = [
      { ...baseSubmission, id: 2, title: '二等奖' },
    ];
    const thirdPrizes: SubmissionInfo[] = [
      { ...baseSubmission, id: 3, title: '三等奖1' },
      { ...baseSubmission, id: 4, title: '三等奖2' },
    ];
    render(
      <AwardResultDisplay
        firstPrize={baseSubmission}
        secondPrizes={secondPrizes}
        thirdPrizes={thirdPrizes}
      />
    );
    expect(screen.getByText('共 4 个获奖作品')).toBeInTheDocument();
  });

  it('仅一等奖统计 1 个', () => {
    render(<AwardResultDisplay firstPrize={baseSubmission} />);
    expect(screen.getByText('共 1 个获奖作品')).toBeInTheDocument();
  });

  it('没有奖项时显示 0 个', () => {
    render(<AwardResultDisplay firstPrize={undefined} secondPrizes={[]} thirdPrizes={[]} />);
    expect(screen.getByText('暂未设置获奖作品')).toBeInTheDocument();
  });
});
