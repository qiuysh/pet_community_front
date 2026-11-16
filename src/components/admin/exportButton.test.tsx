import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportButton } from './exportButton';

describe('ExportButton', () => {
  it('渲染导出按钮', () => {
    render(<ExportButton onExport={() => {}} />);
    expect(screen.getByText('导出数据')).toBeInTheDocument();
  });

  it('点击按钮展开菜单', () => {
    render(<ExportButton onExport={() => {}} />);
    expect(screen.queryByText('概览统计')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('导出数据'));
    expect(screen.getByText('概览统计')).toBeInTheDocument();
    expect(screen.getByText('用户增长')).toBeInTheDocument();
    expect(screen.getByText('内容统计')).toBeInTheDocument();
    expect(screen.getByText('互动统计')).toBeInTheDocument();
  });

  it('再次点击关闭菜单', () => {
    render(<ExportButton onExport={() => {}} />);
    const btn = screen.getByText('导出数据');
    fireEvent.click(btn);
    expect(screen.getByText('概览统计')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByText('概览统计')).not.toBeInTheDocument();
  });

  it('点击菜单项调用 onExport 并关闭菜单', () => {
    const onExport = vi.fn();
    render(<ExportButton onExport={onExport} />);
    fireEvent.click(screen.getByText('导出数据'));
    fireEvent.click(screen.getByText('概览统计'));
    expect(onExport).toHaveBeenCalledWith('overview');
    expect(screen.queryByText('概览统计')).not.toBeInTheDocument();
  });

  it('点击不同导出类型调用对应参数', () => {
    const onExport = vi.fn();
    render(<ExportButton onExport={onExport} />);
    fireEvent.click(screen.getByText('导出数据'));
    fireEvent.click(screen.getByText('用户增长'));
    expect(onExport).toHaveBeenCalledWith('user_growth');
  });

  it('展开后具备 menu 语义，Escape 可关闭', () => {
    render(<ExportButton onExport={() => {}} />);
    const trigger = screen.getByRole('button', { name: '导出数据' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: '导出类型' })).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
