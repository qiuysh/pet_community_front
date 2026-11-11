import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { useFocusTrap } from './useFocusTrap';

function Trap({ active, children }: { active: boolean; children?: React.ReactNode }) {
  const ref = useFocusTrap<HTMLDivElement>(active);
  if (!active) return null;
  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-label="弹层">
      <button type="button">第一个</button>
      <button type="button">第二个</button>
      {children}
    </div>
  );
}

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        打开
      </button>
      <Trap active={open}>
        <button type="button" onClick={() => setOpen(false)}>
          关闭
        </button>
      </Trap>
    </>
  );
}

describe('useFocusTrap', () => {
  it('打开时聚焦容器内首个可聚焦元素', () => {
    render(<Trap active />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '第一个' }));
  });

  it('Tab 在末尾回卷到首个，Shift+Tab 在首个回卷到末尾', () => {
    render(<Trap active />);
    const first = screen.getByRole('button', { name: '第一个' });
    const last = screen.getByRole('button', { name: '第二个' });

    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('关闭后把焦点还给打开前的元素', () => {
    render(<Harness />);
    const opener = screen.getByRole('button', { name: '打开' });
    opener.focus();
    fireEvent.click(opener);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '第一个' }));

    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '打开' }));
  });
});
