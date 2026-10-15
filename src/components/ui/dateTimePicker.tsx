/**
 * 社区 DateTime / Date 选择器：HeroUI DatePicker，对外用 datetime-local 兼容字符串。
 * value 格式：日期时间 `YYYY-MM-DDTHH:mm`；仅日期 `YYYY-MM-DD`。
 */
import type { DateValue } from '@internationalized/date';
import { CalendarDateTime, parseDate, parseDateTime } from '@internationalized/date';
import { Calendar, DateField, DatePicker, TimeField } from '@heroui/react';

export type DateTimePickerGranularity = 'day' | 'minute';
export type DateTimePickerTone = 'primary' | 'secondary';

export interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  /** day=仅日期；minute=日期+时间（默认） */
  granularity?: DateTimePickerGranularity;
  tone?: DateTimePickerTone;
  /** md=表单默认；sm=筛选工具栏 */
  size?: 'md' | 'sm';
  /** 去掉自身边框，嵌入组合控件时使用 */
  bare?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  groupClassName?: string;
  'aria-label'?: string;
  hourCycle?: 12 | 24;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toValueString(v: DateValue | null, granularity: DateTimePickerGranularity): string {
  if (!v) return '';
  const date = `${v.year}-${pad(v.month)}-${pad(v.day)}`;
  if (granularity === 'day') return date;
  const hour = 'hour' in v ? v.hour : 0;
  const minute = 'minute' in v ? v.minute : 0;
  return `${date}T${pad(hour)}:${pad(minute)}`;
}

function fromValueString(raw: string | undefined, granularity: DateTimePickerGranularity): DateValue | null {
  if (!raw?.trim()) return null;
  try {
    if (granularity === 'day') {
      return parseDate(raw.slice(0, 10));
    }
    const normalized = raw.length === 16 ? `${raw}:00` : raw.includes('T') ? raw : `${raw}T00:00:00`;
    return parseDateTime(normalized.slice(0, 19));
  } catch {
    try {
      // 兼容 "YYYY-MM-DD HH:mm:ss"
      const m = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
      if (m) return parseDateTime(`${m[1]}T${m[2]}:${m[3]}:00`);
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const d = parseDate(raw);
        return granularity === 'day' ? d : new CalendarDateTime(d.year, d.month, d.day, 0, 0, 0);
      }
    } catch {
      return null;
    }
    return null;
  }
}

const groupTone: Record<DateTimePickerTone, string> = {
  primary:
    'border-border hover:border-primary/40 data-[focus-within=true]:border-primary data-[focus-within=true]:ring-2 data-[focus-within=true]:ring-primary/20',
  secondary:
    'border-border hover:border-secondary/40 data-[focus-within=true]:border-secondary data-[focus-within=true]:ring-2 data-[focus-within=true]:ring-secondary/20',
};

const sizeGroup: Record<'md' | 'sm', string> = {
  md: 'h-10 min-h-10 px-3 text-sm',
  sm: 'h-10 min-h-10 px-2.5 text-sm',
};

const sizeSegment: Record<'md' | 'sm', string> = {
  md: 'px-0.5 text-sm',
  sm: 'px-0.5 text-sm tabular-nums tracking-tight',
};

const sizeTrigger: Record<'md' | 'sm', string> = {
  md: 'size-7',
  sm: 'size-6',
};

export function DateTimePicker({
  value = '',
  onChange,
  granularity = 'minute',
  tone = 'primary',
  size = 'md',
  bare = false,
  disabled = false,
  invalid = false,
  className = '',
  groupClassName = '',
  hourCycle = 24,
  'aria-label': ariaLabel = granularity === 'day' ? '日期' : '日期时间',
}: DateTimePickerProps) {
  const parsed = fromValueString(value, granularity);
  const showTime = granularity !== 'day';

  return (
    <DatePicker
      aria-label={ariaLabel}
      granularity={granularity}
      hourCycle={hourCycle}
      hideTimeZone
      shouldForceLeadingZeros
      isDisabled={disabled}
      isInvalid={invalid}
      value={parsed}
      onChange={(next) => onChange?.(toValueString(next, granularity))}
      className={['w-full min-w-0', className].filter(Boolean).join(' ')}
    >
      {({ state }) => (
        <>
          <DateField.Group
            fullWidth
            className={[
              sizeGroup[size],
              'flex items-center gap-1 text-brown transition-colors',
              bare
                ? 'rounded-none border-0 bg-transparent shadow-none ring-0 data-[focus-within=true]:ring-0'
                : `rounded-sm border bg-white ${groupTone[tone]}`,
              !bare && invalid ? 'border-error data-[focus-within=true]:ring-error/20' : '',
              disabled ? 'bg-muted text-brown-muted cursor-not-allowed' : '',
              groupClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <DateField.Input className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden">
              {(segment) => (
                <DateField.Segment
                  segment={segment}
                  className={[
                    sizeSegment[size],
                    'rounded-sm text-brown outline-none data-[placeholder=true]:text-brown-muted',
                    tone === 'secondary' ? 'focus:bg-secondary-soft/60' : 'focus:bg-soft',
                  ].join(' ')}
                />
              )}
            </DateField.Input>
            <DateField.Suffix className="shrink-0">
              <DatePicker.Trigger
                className={[
                  sizeTrigger[size],
                  'inline-flex items-center justify-center rounded-sm text-brown-muted transition-colors',
                  tone === 'secondary'
                    ? 'hover:bg-secondary-soft hover:text-secondary-dark'
                    : 'hover:bg-soft hover:text-brown',
                ].join(' ')}
                aria-label="打开日历"
              >
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>

          <DatePicker.Popover className="z-50 flex flex-col gap-3 rounded-sm border border-border-light bg-white p-3 shadow-hover">
            <Calendar aria-label={ariaLabel}>
              <Calendar.Header className="mb-2 flex items-center gap-1">
                <Calendar.YearPickerTrigger className="flex flex-1 items-center gap-1 text-sm font-medium text-brown">
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell className="text-xs text-brown-muted">{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>
                  {(date) => (
                    <Calendar.Cell
                      date={date}
                      className={
                        tone === 'secondary'
                          ? 'data-[selected=true]:bg-secondary data-[selected=true]:text-white'
                          : undefined
                      }
                    />
                  )}
                </Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>

            {showTime ? (
              <div className="flex items-center justify-between gap-3 border-t border-border-light pt-3">
                <span className="shrink-0 text-sm text-brown-secondary">时间</span>
                <TimeField
                  aria-label="时间"
                  granularity="minute"
                  hourCycle={hourCycle}
                  hideTimeZone
                  shouldForceLeadingZeros
                  value={state.timeValue}
                  onChange={(v) => {
                    if (v != null) state.setTimeValue(v);
                  }}
                >
                  <TimeField.Group
                    variant={tone === 'secondary' ? 'secondary' : 'primary'}
                    className="rounded-sm border border-border px-2 py-1"
                  >
                    <TimeField.Input className="flex items-center gap-0.5 text-sm tabular-nums">
                      {(segment) => <TimeField.Segment segment={segment} />}
                    </TimeField.Input>
                  </TimeField.Group>
                </TimeField>
              </div>
            ) : null}
          </DatePicker.Popover>
        </>
      )}
    </DatePicker>
  );
}
