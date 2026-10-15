import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders children and handles click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>提交</Button>);
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant by default', () => {
    render(<Button>主按钮</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--primary');
  });

  it('supports block and disabled', () => {
    render(
      <Button block disabled>
        禁用
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });
});
