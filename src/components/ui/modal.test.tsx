import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './modal';

describe('Modal', () => {
  it('renders title and body when open', () => {
    render(
      <Modal open title="确认" onClose={vi.fn()} footer={null}>
        内容区
      </Modal>
    );
    expect(screen.getByText('确认')).toBeInTheDocument();
    expect(screen.getByText('内容区')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <Modal open={false} title="隐藏" onClose={vi.fn()}>
        x
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose from default footer', () => {
    const onClose = vi.fn();
    render(
      <Modal open title="提示" onClose={onClose}>
        hi
      </Modal>
    );
    const closeButtons = screen.getAllByRole('button', { name: '关闭' });
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(onClose).toHaveBeenCalled();
  });
});
