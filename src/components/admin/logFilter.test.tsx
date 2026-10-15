import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogFilter } from './logFilter';

const baseProps = {
  logType: 'behavior',
  userId: '',
  actionType: '',
  targetType: '',
  startTime: '',
  endTime: '',
  onUserIdChange: vi.fn(),
  onActionTypeChange: vi.fn(),
  onTargetTypeChange: vi.fn(),
  onStartTimeChange: vi.fn(),
  onEndTimeChange: vi.fn(),
};

describe('LogFilter', () => {
  it('输入用户ID不立即搜索，回车才触发 onUserIdChange', () => {
    const onUserIdChange = vi.fn();
    render(<LogFilter {...baseProps} onUserIdChange={onUserIdChange} />);
    const input = screen.getByPlaceholderText('输入用户 ID…');
    fireEvent.change(input, { target: { value: '123' } });
    expect(onUserIdChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onUserIdChange).toHaveBeenCalledWith('123');
  });

  it('安全审计时隐藏操作类型与目标类型', () => {
    render(<LogFilter {...baseProps} logType="security" />);
    expect(screen.queryByRole('button', { name: /操作类型|全部操作类型/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /目标类型|全部目标类型/ })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入用户 ID…')).toBeInTheDocument();
  });

  it('操作日志时隐藏用户 ID 与目标类型', () => {
    render(<LogFilter {...baseProps} logType="operation" />);
    expect(screen.queryByPlaceholderText('输入用户 ID…')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /目标类型|全部目标类型/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /操作类型|全部操作类型/ })).toBeInTheDocument();
  });

  it('选择操作类型触发 onActionTypeChange', async () => {
    const onActionTypeChange = vi.fn();
    render(<LogFilter {...baseProps} onActionTypeChange={onActionTypeChange} />);
    fireEvent.click(screen.getByRole('button', { name: /操作类型|全部操作类型/ }));
    fireEvent.click(await screen.findByRole('option', { name: '登录' }));
    expect(onActionTypeChange).toHaveBeenCalledWith('login');
  });

  it('选择目标类型触发 onTargetTypeChange', async () => {
    const onTargetTypeChange = vi.fn();
    render(<LogFilter {...baseProps} onTargetTypeChange={onTargetTypeChange} />);
    fireEvent.click(screen.getByRole('button', { name: /目标类型|全部目标类型/ }));
    fireEvent.click(await screen.findByRole('option', { name: '用户' }));
    expect(onTargetTypeChange).toHaveBeenCalledWith('user');
  });

  it('筛选项标签与控件同一行', () => {
    render(<LogFilter {...baseProps} />);
    const label = screen.getByText('用户 ID');
    const field = label.parentElement;
    expect(field?.className).toContain('items-center');
    expect(field?.className).not.toContain('flex-col');
    expect(field?.querySelector('input')).toBeTruthy();
  });

  it('不渲染搜索与重置按钮', () => {
    render(<LogFilter {...baseProps} />);
    expect(screen.queryByRole('button', { name: '搜索' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '重置' })).not.toBeInTheDocument();
  });

  it('操作类型下拉项渲染', async () => {
    render(<LogFilter {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /操作类型|全部操作类型/ }));
    expect(await screen.findByRole('option', { name: '全部操作类型' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '登录' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '发布帖子' })).toBeInTheDocument();
  });

  it('目标类型下拉项渲染', async () => {
    render(<LogFilter {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /目标类型|全部目标类型/ }));
    expect(await screen.findByRole('option', { name: '全部目标类型' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '用户' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '帖子' })).toBeInTheDocument();
  });
});
