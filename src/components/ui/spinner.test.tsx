import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('shows label text', () => {
    render(<Spinner label="加载中" />);
    expect(screen.getByText('加载中')).toBeInTheDocument();
  });
});
