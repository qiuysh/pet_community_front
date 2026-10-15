import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>卡片内容</Card>);
    expect(screen.getByText('卡片内容')).toBeInTheDocument();
  });

  it('applies card shadow and radius tokens', () => {
    const { container } = render(<Card>内容</Card>);
    expect(container.firstChild).toHaveClass('rounded-md', 'shadow-card');
  });
});
