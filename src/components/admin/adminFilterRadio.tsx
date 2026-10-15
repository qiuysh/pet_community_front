/**
 * 表单内短选项互斥（如批量审核通过/拒绝）。
 * 列表页固定枚举筛选请用 AdminSelect；整页分区用 AdminTabs。
 */
import { Radio, RadioGroup } from '../ui';

export interface AdminFilterItem {
  key: string;
  label: string;
}

export interface AdminFilterRadioProps {
  items: AdminFilterItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  'aria-label'?: string;
}

export function AdminFilterRadio({
  items,
  value,
  onChange,
  className = '',
  'aria-label': ariaLabel = '筛选',
}: AdminFilterRadioProps) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      orientation="horizontal"
      aria-label={ariaLabel}
      className={['flex flex-wrap gap-2', className].filter(Boolean).join(' ')}
    >
      {items.map((item) => (
        <Radio
          key={item.key}
          value={item.key}
          variant="button"
          tone="secondary"
          className="!flex-none min-w-0"
        >
          {item.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}
