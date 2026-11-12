import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from './notFoundPage';

describe('NotFoundPage', () => {
  beforeEach(() => {
    document.title = '';
  });

  it('渲染 404 文案与操作', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '页面走丢了' })).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回首页' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '去发现' })).toHaveAttribute('href', '/discover');
    expect(document.title).toContain('页面不存在');
  });
});
