import type {
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ChangeEvent,
} from 'react';
import { Children, isValidElement, useMemo } from 'react';
import { Input as HeroInput } from '@heroui/react/input';
import { Label as HeroLabel } from '@heroui/react/label';
import { ListBox } from '@heroui/react/list-box';
import { Select as HeroSelect } from '@heroui/react/select';
import { TextArea as HeroTextArea } from '@heroui/react/textarea';

function joinClass(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

interface ParsedOption {
  value: string;
  label: ReactNode;
  textValue: string;
  disabled?: boolean;
}

function optionText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(optionText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return optionText(node.props.children);
  return '';
}

/** 从原生 <option> children 解析，兼容现有页面写法 */
function parseSelectOptions(children: ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>;
    if (el.type !== 'option') return;
    const value = el.props.value == null ? '' : String(el.props.value);
    const label = el.props.children;
    options.push({
      value,
      label,
      textValue: optionText(label) || value,
      disabled: el.props.disabled,
    });
  });
  return options;
}

const controlExtra =
  'h-10 min-h-10 rounded-sm border border-border bg-white text-sm text-brown ' +
  'placeholder:text-brown-muted shadow-none ' +
  'focus:border-primary focus:ring-2 focus:ring-primary/20';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean;
}

export function Input({
  invalid = false,
  className = '',
  type = 'text',
  disabled,
  onChange,
  ...rest
}: InputProps) {
  if (type === 'datetime-local' || type === 'date' || type === 'time') {
    throw new Error(
      `Input 不支持 type="${type}"，请使用 components/ui 的 DateTimePicker（或 AdminDateTime）`,
    );
  }

  return (
    <HeroInput
      type={type}
      fullWidth
      disabled={disabled}
      aria-invalid={invalid || undefined}
      data-invalid={invalid || undefined}
      className={joinClass(controlExtra, invalid && 'border-error', className)}
      onChange={onChange as ((e: ChangeEvent<HTMLInputElement>) => void) | undefined}
      {...rest}
    />
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({
  invalid = false,
  className = '',
  disabled,
  onChange,
  ...rest
}: TextareaProps) {
  return (
    <HeroTextArea
      fullWidth
      disabled={disabled}
      aria-invalid={invalid || undefined}
      data-invalid={invalid || undefined}
      className={joinClass(controlExtra, 'resize-none', invalid && 'border-error', className)}
      onChange={onChange as ((e: ChangeEvent<HTMLTextAreaElement>) => void) | undefined}
      {...rest}
    />
  );
}

/**
 * HeroUI Select；对外仍可写 <option>，内部转 ListBox。
 * onChange 保持 ChangeEvent 形态（e.target.value），兼容现有表单。
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  invalid?: boolean;
  /** 社区默认 primary；后台表单可用 secondary */
  tone?: 'primary' | 'secondary';
}

const selectToneHover: Record<'primary' | 'secondary', string> = {
  primary: 'hover:border-primary/40 data-[focus-visible=true]:ring-primary/20 data-[focus-visible=true]:border-primary',
  secondary:
    'hover:border-secondary/40 data-[focus-visible=true]:ring-secondary/20 data-[focus-visible=true]:border-secondary',
};

const selectItemSelected: Record<'primary' | 'secondary', string> = {
  primary: 'data-[selected=true]:bg-primary-soft data-[selected=true]:text-primary-dark',
  secondary: 'data-[selected=true]:bg-secondary-soft data-[selected=true]:text-secondary-dark',
};

/** HeroUI ListBox 不允许空 id；空 option 映射为哨兵 */
const EMPTY_OPTION_ID = '__empty__';

function toSelectKey(raw: string | number | readonly string[] | undefined): string | undefined {
  if (raw == null) return undefined;
  const s = String(Array.isArray(raw) ? raw[0] : raw);
  return s === '' ? EMPTY_OPTION_ID : s;
}

function fromSelectKey(key: string | number | null): string {
  if (key == null) return '';
  const s = String(key);
  return s === EMPTY_OPTION_ID ? '' : s;
}

export function Select({
  invalid = false,
  className = '',
  children,
  value,
  defaultValue,
  onChange,
  disabled,
  name,
  id,
  tone = 'primary',
  'aria-label': ariaLabel,
}: SelectProps) {
  const options = useMemo(() => parseSelectOptions(children), [children]);

  const emitChange = (next: string) => {
    if (!onChange) return;
    onChange({
      target: { value: next, name: name ?? '' },
      currentTarget: { value: next, name: name ?? '' },
    } as ChangeEvent<HTMLSelectElement>);
  };

  const selectedKey = toSelectKey(value);
  const defaultKey = toSelectKey(defaultValue);

  return (
    <HeroSelect
      fullWidth
      name={name}
      value={selectedKey}
      defaultValue={value === undefined ? defaultKey : undefined}
      onChange={(key) => emitChange(fromSelectKey(key as string | number | null))}
      isDisabled={disabled}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      data-invalid={invalid || undefined}
      className={joinClass('w-full min-w-0', className)}
    >
      <HeroSelect.Trigger
        id={id}
        className={joinClass(
          'w-full h-10 min-h-10 px-3 border border-border rounded-sm text-sm text-brown bg-white',
          'inline-flex items-center justify-between gap-2 transition-colors shadow-none',
          'data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-2',
          'disabled:bg-muted disabled:text-brown-muted disabled:cursor-not-allowed',
          selectToneHover[tone],
          invalid && 'border-error data-[focus-visible=true]:ring-error/20 data-[focus-visible=true]:border-error',
        )}
      >
        <HeroSelect.Value className="truncate text-left flex-1 min-w-0" />
        <HeroSelect.Indicator className="shrink-0 text-brown-muted" />
      </HeroSelect.Trigger>
      <HeroSelect.Popover className="rounded-sm border border-border-light bg-white shadow-hover z-50">
        <ListBox className="max-h-60 overflow-auto p-1 outline-none">
          {options.map((opt) => {
            const itemId = opt.value === '' ? EMPTY_OPTION_ID : opt.value;
            return (
              <ListBox.Item
                key={itemId}
                id={itemId}
                textValue={opt.textValue || ' '}
                isDisabled={opt.disabled}
                className={joinClass(
                  'cursor-pointer rounded-sm px-3 py-2 text-sm text-brown-secondary outline-none data-[focused=true]:bg-soft',
                  selectItemSelected[tone],
                )}
              >
                {opt.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            );
          })}
        </ListBox>
      </HeroSelect.Popover>
    </HeroSelect>
  );
}

export interface FieldLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldLabel({ htmlFor, required, children, className = '' }: FieldLabelProps) {
  return (
    <HeroLabel
      htmlFor={htmlFor}
      className={joinClass('block text-sm font-medium text-brown-secondary mb-1', className)}
    >
      {children}
      {required ? <span className="text-error ml-0.5">*</span> : null}
    </HeroLabel>
  );
}
