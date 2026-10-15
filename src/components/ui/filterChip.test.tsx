import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterChip } from './filterChip';

describe('FilterChip', () => {
  it('renders and handles click', () => {
    const onClick = vi.fn();
    render(<FilterChip onClick={onClick}>全部</FilterChip>);
    fireEvent.click(screen.getByRole('button', { name: '全部' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies active primary styles', () => {
    render(<FilterChip active>选中</FilterChip>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('applies secondary tone when active', () => {
    render(
      <FilterChip active tone="secondary">
        进行中
      </FilterChip>
    );
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');
  });
});
