/**
 * 后台表单控件：走社区 components/ui（HeroUI），叠青竹 tone / h-10，与列表搜索栏对齐。
 */
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { DateTimePicker, FieldLabel, Input, Select, Textarea } from '../ui';
import type { DateTimePickerGranularity } from '../ui';
import { adminUi } from '../../styles/adminUi';

function joinClass(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/** 后台：青竹 focus，覆盖社区默认蜜桃 focus */
const adminFocus =
  'h-10 text-sm hover:border-secondary/40 focus:border-secondary focus:ring-secondary/20 ' +
  '[&:focus]:border-secondary [&:focus]:ring-secondary/20';

export interface AdminLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function AdminLabel({ htmlFor, required, children, className = '' }: AdminLabelProps) {
  return (
    <FieldLabel
      htmlFor={htmlFor}
      required={required}
      className={joinClass(adminUi.label, 'mb-0', className)}
    >
      {children}
    </FieldLabel>
  );
}

export interface AdminInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
  /** 文本类 type；日期时间请用 AdminDateTime */
  type?: Exclude<InputHTMLAttributes<HTMLInputElement>['type'], 'datetime-local' | 'date' | 'time'>;
}

export function AdminInput({ invalid = false, className = '', type = 'text', ...rest }: AdminInputProps) {
  return (
    <Input
      type={type}
      invalid={invalid}
      className={joinClass(adminFocus, invalid && adminUi.controlInvalid, className)}
      {...rest}
    />
  );
}

export interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function AdminSelect({ invalid = false, className = '', children, ...rest }: AdminSelectProps) {
  return (
    <Select invalid={invalid} tone="secondary" className={joinClass('w-full min-w-0', className)} {...rest}>
      {children}
    </Select>
  );
}

export interface AdminDateTimeProps {
  value?: string;
  onChange?: (value: string) => void;
  granularity?: DateTimePickerGranularity;
  size?: 'md' | 'sm';
  /** 去掉自身边框，嵌入组合控件时使用 */
  bare?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  groupClassName?: string;
  'aria-label'?: string;
}

/** 后台日期/时间：HeroUI DatePicker，禁止原生 datetime-local */
export function AdminDateTime({
  value = '',
  onChange,
  granularity = 'minute',
  size = 'md',
  bare = false,
  invalid = false,
  disabled = false,
  className = '',
  groupClassName = '',
  'aria-label': ariaLabel,
}: AdminDateTimeProps) {
  return (
    <DateTimePicker
      value={value}
      onChange={onChange}
      granularity={granularity}
      tone="secondary"
      size={size}
      bare={bare}
      invalid={invalid}
      disabled={disabled}
      className={className}
      groupClassName={groupClassName}
      aria-label={ariaLabel}
    />
  );
}

export interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function AdminTextarea({ invalid = false, className = '', ...rest }: AdminTextareaProps) {
  return (
    <Textarea
      invalid={invalid}
      className={joinClass(
        'min-h-[6rem] text-sm hover:border-secondary/40 focus:border-secondary focus:ring-secondary/20',
        invalid && adminUi.controlInvalid,
        className,
      )}
      {...rest}
    />
  );
}

export interface AdminHintProps {
  children: ReactNode;
  className?: string;
}

export function AdminHint({ children, className = '' }: AdminHintProps) {
  return <p className={joinClass(adminUi.hint, className)}>{children}</p>;
}
