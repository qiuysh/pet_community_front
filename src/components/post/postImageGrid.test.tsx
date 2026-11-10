import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PostImageGrid } from './postImageGrid';

describe('PostImageGrid', () => {
  it('上移下移调整顺序，首图为封面', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PostImageGrid
        images={['img-a', 'img-b', 'img-c']}
        onChange={onChange}
        onAddClick={vi.fn()}
      />,
    );

    expect(screen.getByText('封面')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('将第 2 张图片上移'));
    expect(onChange).toHaveBeenCalledWith(['img-b', 'img-a', 'img-c']);

    onChange.mockClear();
    rerender(
      <PostImageGrid
        images={['img-b', 'img-a', 'img-c']}
        onChange={onChange}
        onAddClick={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText('将第 1 张图片下移'));
    expect(onChange).toHaveBeenCalledWith(['img-a', 'img-b', 'img-c']);
  });

  it('删除图片', () => {
    const onChange = vi.fn();
    render(
      <PostImageGrid images={['img-a', 'img-b']} onChange={onChange} onAddClick={vi.fn()} />,
    );
    fireEvent.click(screen.getByLabelText('删除第 1 张图片'));
    expect(onChange).toHaveBeenCalledWith(['img-b']);
  });
});
