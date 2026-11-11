import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useConfirm } from './useConfirm';

function Harness({ results }: { results: boolean[] }) {
  const { confirm, confirmDialog } = useConfirm();
  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          results.push(
            await confirm({
              title: '删除这张照片？',
              description: '删除后无法恢复',
              confirmText: '删除',
            }),
          );
        }}
      >
        触发
      </button>
      {confirmDialog}
    </div>
  );
}

describe('useConfirm', () => {
  it('未触发时不渲染弹层', () => {
    render(<Harness results={[]} />);
    expect(screen.queryByText('删除这张照片？')).not.toBeInTheDocument();
  });

  it('取消返回 false，确认返回 true', async () => {
    const results: boolean[] = [];
    render(<Harness results={results} />);

    fireEvent.click(screen.getByRole('button', { name: '触发' }));
    expect(await screen.findByText('删除这张照片？')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    await waitFor(() => expect(results).toEqual([false]));

    fireEvent.click(screen.getByRole('button', { name: '触发' }));
    fireEvent.click(await screen.findByRole('button', { name: '删除' }));
    await waitFor(() => expect(results).toEqual([false, true]));
  });
});
