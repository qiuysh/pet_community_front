import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageSkeleton } from './lazyPage';

describe('PageSkeleton', () => {
  it('前台保持 1120 列宽（page-shell）', () => {
    render(<PageSkeleton />);
    const el = screen.getByRole('status', { name: '页面加载中' });
    expect(el.className).toContain('page-shell');
    expect(el.className).toContain('px-4');
  });

  it('后台 fullWidth 铺满内容容器，不再套 page-shell', () => {
    render(<PageSkeleton fullWidth />);
    const el = screen.getByRole('status', { name: '页面加载中' });
    expect(el.className).not.toContain('page-shell');
    expect(el.className).not.toContain('px-4');
    expect(el.className).toContain('w-full');
  });
});
