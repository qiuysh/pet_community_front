import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const navigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

import { PageHeader } from './pageHeader';

describe('PageHeader', () => {
  it('渲染标题与返回按钮', () => {
    render(<PageHeader title="消息" />);
    expect(screen.getByRole('heading', { name: '消息' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument();
  });

  it('back=false 时不渲染返回按钮', () => {
    render(<PageHeader title="设置" back={false} />);
    expect(screen.queryByRole('button', { name: '返回' })).not.toBeInTheDocument();
  });

  it('渲染右侧操作区', () => {
    render(<PageHeader title="通知" right={<button type="button">全部已读</button>} />);
    expect(screen.getByRole('button', { name: '全部已读' })).toBeInTheDocument();
  });

  it('返回按钮可点击', () => {
    render(<PageHeader title="积分" fallbackTo="/profile" />);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(navigate).toHaveBeenCalledWith('/profile');
  });
});
