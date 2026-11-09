import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MentionText } from './mentionText';

describe('MentionText', () => {
  it('highlights @nicknames', () => {
    render(<MentionText text="你好 @Alice 和 @Bob" />);
    expect(screen.getByText('@Alice')).toHaveClass('mention-token');
    expect(screen.getByText('@Bob')).toHaveClass('mention-token');
  });

  it('renders plain text without mentions', () => {
    render(<MentionText text="没有提及" />);
    expect(screen.getByText('没有提及')).toBeInTheDocument();
  });
});
