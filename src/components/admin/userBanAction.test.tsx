import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../api/admin', () => ({
  banFrontUser: vi.fn(),
  unbanFrontUser: vi.fn(),
}));

import { banFrontUser, unbanFrontUser } from '../../api/admin';
import { UserBanAction } from './userBanAction';

describe('UserBanAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('未封禁时显示封禁按钮', () => {
    render(<UserBanAction userId={1} userName="user1" isBanned={false} onSuccess={() => {}} />);
    expect(screen.getByRole('button', { name: '封禁' })).toBeInTheDocument();
  });

  it('已封禁时显示解封按钮', () => {
    render(<UserBanAction userId={1} userName="user1" isBanned={true} onSuccess={() => {}} />);
    expect(screen.getByRole('button', { name: '解封' })).toBeInTheDocument();
  });

  it('点击封禁按钮打开弹窗并显示用户信息', () => {
    render(<UserBanAction userId={1} userName="测试用户" isBanned={false} onSuccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '封禁' }));
    expect(screen.getByText('确认封禁')).toBeInTheDocument();
    expect(screen.getByText(/测试用户/)).toBeInTheDocument();
  });

  it('点击解封按钮打开弹窗', () => {
    render(<UserBanAction userId={1} userName="user1" isBanned={true} onSuccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '解封' }));
    expect(screen.getByText('确认解封')).toBeInTheDocument();
    expect(screen.getByText('账号将恢复正常使用')).toBeInTheDocument();
  });

  it('封禁时显示封禁原因输入框', () => {
    render(<UserBanAction userId={1} userName="u" isBanned={false} onSuccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '封禁' }));
    expect(screen.getByText(/封禁原因/)).toBeInTheDocument();
  });

  it('解封时不显示封禁原因输入框', () => {
    render(<UserBanAction userId={1} userName="u" isBanned={true} onSuccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '解封' }));
    expect(screen.queryByText(/封禁原因/)).not.toBeInTheDocument();
  });

  it('封禁时空原因提示错误', async () => {
    render(<UserBanAction userId={1} userName="u" isBanned={false} onSuccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '封禁' }));
    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    await waitFor(() => {
      expect(screen.getByText('请填写封禁原因')).toBeInTheDocument();
    });
    expect(banFrontUser).not.toHaveBeenCalled();
  });

  it('填写原因后封禁成功', async () => {
    vi.mocked(banFrontUser).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    render(<UserBanAction userId={1} userName="u" isBanned={false} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: '封禁' }));
    fireEvent.change(screen.getByPlaceholderText(/请输入封禁原因/), { target: { value: '违规' } });
    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    await waitFor(() => {
      expect(banFrontUser).toHaveBeenCalledWith(1, { reason: '违规' });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('解封成功调用 unbanFrontUser', async () => {
    vi.mocked(unbanFrontUser).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    render(<UserBanAction userId={1} userName="u" isBanned={true} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: '解封' }));
    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    await waitFor(() => {
      expect(unbanFrontUser).toHaveBeenCalledWith(1);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('封禁失败显示错误信息', async () => {
    vi.mocked(banFrontUser).mockRejectedValue(new Error('封禁失败'));
    render(<UserBanAction userId={1} userName="u" isBanned={false} onSuccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '封禁' }));
    fireEvent.change(screen.getByPlaceholderText(/请输入封禁原因/), { target: { value: '原因' } });
    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    await waitFor(() => {
      expect(screen.getByText('封禁失败')).toBeInTheDocument();
    });
  });

  it('点击取消关闭弹窗', () => {
    render(<UserBanAction userId={1} userName="u" isBanned={false} onSuccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '封禁' }));
    expect(screen.getByText('确认封禁')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.queryByText('确认封禁')).not.toBeInTheDocument();
  });
});
