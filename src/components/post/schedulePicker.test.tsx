import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SchedulePicker,
  getDefaultScheduleTime,
  roundUpToMinuteStep,
  toScheduleValue,
} from './schedulePicker';

describe('schedulePicker helpers', () => {
  it('toScheduleValue 应输出本地 YYYY-MM-DDTHH:mm', () => {
    const d = new Date(2026, 9, 12, 15, 5, 0);
    expect(toScheduleValue(d)).toBe('2026-10-12T15:05');
  });

  it('roundUpToMinuteStep 应按步进向上取整', () => {
    const d = new Date(2026, 9, 12, 15, 1, 0);
    const rounded = roundUpToMinuteStep(d, 5);
    expect(rounded.getMinutes()).toBe(5);
  });

  it('getDefaultScheduleTime 应约为一小时后', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 12, 10, 0, 0));
    expect(getDefaultScheduleTime(5)).toBe('2026-10-12T11:00');
    vi.useRealTimers();
  });
});

describe('SchedulePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 12, 10, 0, 0)); // Monday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应展示快捷预设与日期时间下拉', () => {
    const onChange = vi.fn();
    render(<SchedulePicker value="2026-10-12T20:00" onChange={onChange} />);

    expect(screen.getByRole('group', { name: '快捷时间' })).toBeInTheDocument();
    expect(screen.getByLabelText('发布日期')).toBeInTheDocument();
    expect(screen.getByLabelText('小时')).toBeInTheDocument();
    expect(screen.getByLabelText('分钟')).toBeInTheDocument();
    expect(screen.getByText(/将于今天 20:00 自动发布/)).toBeInTheDocument();
  });

  it('点击快捷预设应回调对应时间', () => {
    const onChange = vi.fn();
    render(<SchedulePicker value="2026-10-12T20:00" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '1小时后' }));
    expect(onChange).toHaveBeenCalledWith('2026-10-12T11:00');
  });

  it('选择过去时间应自动校正到未来', () => {
    const onChange = vi.fn();
    render(<SchedulePicker value="2026-10-12T20:00" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('小时'), { target: { value: '9' } });
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0][0] as string;
    expect(new Date(next).getTime()).toBeGreaterThan(Date.now());
  });
});
