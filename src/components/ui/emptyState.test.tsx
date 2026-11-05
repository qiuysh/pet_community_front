import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { EmptyState } from './emptyState';

describe('EmptyState', () => {
  it('渲染标题', () => {
    render(<EmptyState title="暂无消息" />);
    expect(screen.getByText('暂无消息')).toBeInTheDocument();
  });

  it('渲染说明与行动按钮', () => {
    render(
      <EmptyState
        title="暂无消息"
        description="发起一次对话试试"
        action={<button type="button">发起对话</button>}
      />
    );
    expect(screen.getByText('发起一次对话试试')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '发起对话' })).toBeInTheDocument();
  });

  it('图标对辅助技术隐藏', () => {
    const { container } = render(<EmptyState title="暂无数据" icon={<Inbox size={48} />} />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });
});
