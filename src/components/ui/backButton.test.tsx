import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const navigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

import { BackButton } from './backButton';

describe('BackButton', () => {
  beforeEach(() => {
    navigate.mockClear();
    window.history.replaceState({ idx: 0 }, '');
  });

  it('有站内历史时回退一步', () => {
    window.history.replaceState({ idx: 2 }, '');
    render(<BackButton />);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it('直接打开页面时回退到 fallbackTo', () => {
    render(<BackButton fallbackTo="/messages" />);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(navigate).toHaveBeenCalledWith('/messages');
  });

  it('支持自定义标签', () => {
    render(<BackButton label="返回消息列表" />);
    expect(screen.getByRole('button', { name: '返回消息列表' })).toBeInTheDocument();
  });
});
