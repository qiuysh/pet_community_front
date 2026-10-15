import { useMemo } from 'react';
import { FilterChip } from '../ui/filterChip';
import { FieldLabel, Select } from '../ui/input';
import './schedulePicker.scss';

export interface SchedulePickerProps {
  /** 本地时间值：YYYY-MM-DDTHH:mm */
  value: string;
  onChange: (value: string) => void;
  /** 最多可延迟天数，默认 7 */
  maxDays?: number;
  /** 分钟步进，默认 5 */
  minuteStep?: number;
}

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Date → YYYY-MM-DDTHH:mm（本地时区） */
export function toScheduleValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 向上取整到分钟步进 */
export function roundUpToMinuteStep(date: Date, step = 5): Date {
  const d = new Date(date.getTime());
  d.setSeconds(0, 0);
  const minutes = d.getMinutes();
  const remainder = minutes % step;
  if (remainder !== 0) {
    d.setMinutes(minutes + (step - remainder));
  }
  return d;
}

/** 切换到定时发布时的默认时间：约 1 小时后 */
export function getDefaultScheduleTime(minuteStep = 5): string {
  return toScheduleValue(roundUpToMinuteStep(new Date(Date.now() + 60 * 60 * 1000), minuteStep));
}

function parseScheduleValue(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildDateOptions(maxDays: number): Array<{ value: string; label: string }> {
  const today = startOfDay(new Date());
  const options: Array<{ value: string; label: string }> = [];

  for (let i = 0; i <= maxDays; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const value = formatDateKey(d);
    const monthDay = `${d.getMonth() + 1}月${d.getDate()}日`;
    const weekday = WEEKDAY_LABELS[d.getDay()];

    let prefix = weekday;
    if (i === 0) prefix = '今天';
    else if (i === 1) prefix = '明天';
    else if (i === 2) prefix = '后天';

    options.push({ value, label: `${prefix} ${monthDay} · ${weekday}` });
  }

  return options;
}

function buildMinuteOptions(step: number, currentMinute?: number): number[] {
  const options: number[] = [];
  for (let m = 0; m < 60; m += step) {
    options.push(m);
  }
  if (currentMinute !== undefined && !options.includes(currentMinute)) {
    options.push(currentMinute);
    options.sort((a, b) => a - b);
  }
  return options;
}

interface Preset {
  id: string;
  label: string;
  getDate: () => Date | null;
}

function buildPresets(maxDays: number, minuteStep: number): Preset[] {
  const now = new Date();
  const maxTime = now.getTime() + maxDays * 24 * 60 * 60 * 1000;

  const makeAt = (dayOffset: number, hour: number, minute: number): Date | null => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    if (d.getTime() <= now.getTime() || d.getTime() > maxTime) return null;
    return d;
  };

  const presets: Preset[] = [
    {
      id: '1h',
      label: '1小时后',
      getDate: () => roundUpToMinuteStep(new Date(Date.now() + 60 * 60 * 1000), minuteStep),
    },
    {
      id: '3h',
      label: '3小时后',
      getDate: () => {
        const d = roundUpToMinuteStep(new Date(Date.now() + 3 * 60 * 60 * 1000), minuteStep);
        return d.getTime() > maxTime ? null : d;
      },
    },
    {
      id: 'tonight',
      label: '今晚 20:00',
      getDate: () => makeAt(0, 20, 0),
    },
    {
      id: 'tomorrow-am',
      label: '明天 09:00',
      getDate: () => makeAt(1, 9, 0),
    },
    {
      id: 'tomorrow-pm',
      label: '明天 20:00',
      getDate: () => makeAt(1, 20, 0),
    },
    {
      id: 'weekend',
      label: '本周六 10:00',
      getDate: () => {
        const day = now.getDay(); // 0 Sun ... 6 Sat
        let offset: number;
        if (day === 6) {
          offset = now.getHours() >= 10 ? 7 : 0;
        } else {
          offset = (6 - day + 7) % 7;
        }
        return makeAt(offset, 10, 0);
      },
    },
  ];

  return presets.filter((p) => {
    const d = p.getDate();
    return d !== null && d.getTime() > now.getTime() && d.getTime() <= maxTime;
  });
}

function formatSummary(date: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (diffDays === 0) return `将于今天 ${time} 自动发布`;
  if (diffDays === 1) return `将于明天 ${time} 自动发布`;
  if (diffDays === 2) return `将于后天 ${time} 自动发布`;
  return `将于${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAY_LABELS[date.getDay()]} ${time} 自动发布`;
}

function combineValue(dateStr: string, hour: number, minute: number): string {
  return `${dateStr}T${pad(hour)}:${pad(minute)}`;
}

function clampToValidRange(dateStr: string, hour: number, minute: number, maxDays: number, minuteStep: number): string {
  const candidate = new Date(combineValue(dateStr, hour, minute));
  const now = Date.now();
  const maxTime = now + maxDays * 24 * 60 * 60 * 1000;

  if (Number.isNaN(candidate.getTime()) || candidate.getTime() <= now) {
    return toScheduleValue(roundUpToMinuteStep(new Date(now + 60 * 1000), minuteStep));
  }
  if (candidate.getTime() > maxTime) {
    return toScheduleValue(roundUpToMinuteStep(new Date(maxTime), minuteStep));
  }
  return combineValue(dateStr, hour, minute);
}

/**
 * 定时发布时间选择器
 *
 * 快捷预设 + 日期/时/分下拉，替代难用的原生 datetime-local。
 * 值格式与 datetime-local 一致：YYYY-MM-DDTHH:mm
 */
export function SchedulePicker({
  value,
  onChange,
  maxDays = 7,
  minuteStep = 5,
}: SchedulePickerProps) {
  const selected = parseScheduleValue(value);
  const dateOptions = useMemo(() => buildDateOptions(maxDays), [maxDays]);
  const presets = useMemo(() => buildPresets(maxDays, minuteStep), [maxDays, minuteStep]);

  const dateStr = selected ? formatDateKey(selected) : dateOptions[0]?.value ?? '';
  const hour = selected?.getHours() ?? 9;
  const minute = selected?.getMinutes() ?? 0;

  const minuteOptions = useMemo(
    () => buildMinuteOptions(minuteStep, selected?.getMinutes()),
    [minuteStep, selected],
  );

  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const emit = (nextDate: string, nextHour: number, nextMinute: number) => {
    onChange(clampToValidRange(nextDate, nextHour, nextMinute, maxDays, minuteStep));
  };

  const activePresetId = presets.find((p) => {
    const d = p.getDate();
    return d && value === toScheduleValue(d);
  })?.id;

  return (
    <div className="schedule-picker">
      <div className="schedule-presets" role="group" aria-label="快捷时间">
        {presets.map((preset) => (
          <FilterChip
            key={preset.id}
            active={activePresetId === preset.id}
            className="preset-chip"
            onClick={() => {
              const d = preset.getDate();
              if (d) onChange(toScheduleValue(d));
            }}
          >
            {preset.label}
          </FilterChip>
        ))}
      </div>

      <div className="schedule-fields">
        <div className="schedule-field">
          <FieldLabel className="field-label">日期</FieldLabel>
          <Select
            className="schedule-select"
            value={dateStr}
            aria-label="发布日期"
            onChange={(e) => emit(e.target.value, hour, minute)}
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="schedule-field schedule-field-time">
          <FieldLabel className="field-label">时间</FieldLabel>
          <div className="time-selects">
            <Select
              className="schedule-select"
              value={hour}
              aria-label="小时"
              onChange={(e) => emit(dateStr, Number(e.target.value), minute)}
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {pad(h)} 时
                </option>
              ))}
            </Select>
            <span className="time-sep" aria-hidden="true">
              :
            </span>
            <Select
              className="schedule-select"
              value={minute}
              aria-label="分钟"
              onChange={(e) => emit(dateStr, hour, Number(e.target.value))}
            >
              {minuteOptions.map((m) => (
                <option key={m} value={m}>
                  {pad(m)} 分
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <p className="schedule-summary">
        {selected ? formatSummary(selected) : '请选择发布时间'}
      </p>
      <p className="schedule-hint">最多延迟 {maxDays} 天，到点将自动发布</p>
    </div>
  );
}
