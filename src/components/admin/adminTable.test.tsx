import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminTableSkeleton } from './adminTable';

describe('AdminTableSkeleton', () => {
  it('按行列数渲染占位并保留加载语义', () => {
    const { container } = render(<AdminTableSkeleton rows={3} columns={4} />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('加载中…')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="admin-table-skeleton-row"]')).toHaveLength(3);
  });
});
