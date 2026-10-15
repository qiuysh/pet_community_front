import type { ReactNode } from 'react';
import { Radio as HeroRadio } from '@heroui/react/radio';
import { RadioGroup as HeroRadioGroup } from '@heroui/react/radio-group';

export interface RadioGroupProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  'aria-label'?: string;
}

export function RadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  disabled = false,
  className = '',
  children,
  orientation = 'horizontal',
  'aria-label': ariaLabel,
}: RadioGroupProps) {
  return (
    <HeroRadioGroup
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      isDisabled={disabled}
      orientation={orientation}
      aria-label={ariaLabel}
      className={[
        orientation === 'horizontal' ? 'flex flex-wrap gap-3' : 'flex flex-col gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </HeroRadioGroup>
  );
}

export type RadioVariant = 'default' | 'card' | 'button';
export type RadioTone = 'primary' | 'secondary';

export interface RadioProps {
  value: string;
  children: ReactNode;
  className?: string;
  /** default=圆点+文案；card=隐私卡片；button=分段筛选按钮 */
  variant?: RadioVariant;
  /** 社区默认 primary；后台筛选用 secondary */
  tone?: RadioTone;
  disabled?: boolean;
}

const buttonSelected: Record<RadioTone, string> = {
  primary:
    'group-data-[selected=true]:border-primary group-data-[selected=true]:bg-primary-soft group-data-[selected=true]:text-primary-dark',
  secondary:
    'group-data-[selected=true]:border-secondary group-data-[selected=true]:bg-secondary-soft group-data-[selected=true]:text-secondary-dark',
};

const cardSelected: Record<RadioTone, string> = {
  primary: 'data-[selected=true]:border-primary data-[selected=true]:bg-primary-soft',
  secondary: 'data-[selected=true]:border-secondary data-[selected=true]:bg-secondary-soft',
};

const controlTone: Record<RadioTone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
};

const textSelected: Record<RadioTone, string> = {
  primary: 'group-data-[selected=true]:text-primary-dark',
  secondary: 'group-data-[selected=true]:text-secondary-dark',
};

export function Radio({
  value,
  children,
  className = '',
  variant = 'default',
  tone = 'primary',
  disabled = false,
}: RadioProps) {
  if (variant === 'button') {
    return (
      <HeroRadio value={value} isDisabled={disabled} className={['flex-1', className].filter(Boolean).join(' ')}>
        <HeroRadio.Content className="group flex w-full cursor-pointer">
          <span className="sr-only">
            <HeroRadio.Control>
              <HeroRadio.Indicator />
            </HeroRadio.Control>
          </span>
          <div
            className={[
              'w-full text-center px-3 py-2 rounded-sm border transition-colors text-sm font-medium',
              'border-border-light text-brown-secondary hover:border-border bg-soft',
              buttonSelected[tone],
            ].join(' ')}
          >
            {children}
          </div>
        </HeroRadio.Content>
      </HeroRadio>
    );
  }

  if (variant === 'card') {
    return (
      <HeroRadio
        value={value}
        isDisabled={disabled}
        className={['w-full', className].filter(Boolean).join(' ')}
      >
        <HeroRadio.Content
          className={[
            'group flex w-full cursor-pointer items-center gap-2 rounded-sm border border-border-light',
            'px-3 py-2.5 transition-colors hover:border-secondary/30',
            cardSelected[tone],
          ].join(' ')}
        >
          <HeroRadio.Control className={`size-4 shrink-0 ${controlTone[tone]}`}>
            <HeroRadio.Indicator />
          </HeroRadio.Control>
          <span className={`text-sm text-brown-secondary ${textSelected[tone]}`}>{children}</span>
        </HeroRadio.Content>
      </HeroRadio>
    );
  }

  return (
    <HeroRadio value={value} isDisabled={disabled} className={className}>
      <HeroRadio.Content className="inline-flex cursor-pointer items-center gap-2">
        <HeroRadio.Control className={`size-4 shrink-0 ${controlTone[tone]}`}>
          <HeroRadio.Indicator />
        </HeroRadio.Control>
        <span className="text-sm text-brown-secondary">{children}</span>
      </HeroRadio.Content>
    </HeroRadio>
  );
}
