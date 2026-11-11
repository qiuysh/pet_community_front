import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostPinAction } from './postPinAction';

vi.mock('../../api/admin', () => ({
  pinPost: vi.fn(() => Promise.resolve()),
  featurePost: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../utils/toastManager', () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

import { pinPost, featurePost } from '../../api/admin';

describe('PostPinAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses server flags as initial labels', () => {
    render(<PostPinAction postId={9} isPinned={1} isFeatured={1} />);
    expect(screen.getByRole('button', { name: '取消置顶' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消精选' })).toBeInTheDocument();
  });

  it('toggles pin from unpinned state', async () => {
    render(<PostPinAction postId={3} isPinned={0} isFeatured={0} />);
    fireEvent.click(screen.getByRole('button', { name: '置顶动态' }));
    await waitFor(() => {
      expect(pinPost).toHaveBeenCalledWith(3, 1);
    });
  });

  it('toggles feature off when already featured', async () => {
    render(<PostPinAction postId={5} isFeatured={1} />);
    fireEvent.click(screen.getByRole('button', { name: '取消精选' }));
    await waitFor(() => {
      expect(featurePost).toHaveBeenCalledWith(5, 0);
    });
  });
});
