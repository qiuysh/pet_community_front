import type { ReactNode } from 'react';
import { Tabs as HeroTabs } from '@heroui/react/tabs';

export interface TabItem {
  key: string;
  title: ReactNode;
  content?: ReactNode;
}

export type TabsTone = 'primary' | 'secondary';

export interface TabsProps {
  items: TabItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  className?: string;
  /** 仅渲染 Tab 列表（内容由页面自行渲染） */
  listOnly?: boolean;
  /** 社区默认 primary；后台分区可用 secondary */
  tone?: TabsTone;
  /** 列表与各项等分铺满容器（个人页移动端等） */
  stretch?: boolean;
  /** 非 stretch 时将 Tab 列表水平居中（登录/注册等） */
  centered?: boolean;
  'aria-label'?: string;
}

const selectedToneClass: Record<TabsTone, string> = {
  primary: 'data-[selected=true]:bg-white data-[selected=true]:text-primary data-[selected=true]:shadow-card',
  secondary:
    'data-[selected=true]:bg-white data-[selected=true]:text-secondary-dark data-[selected=true]:shadow-card',
};

export function Tabs({
  items,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  className = '',
  listOnly = false,
  tone = 'primary',
  stretch = false,
  centered = false,
  'aria-label': ariaLabel,
}: TabsProps) {
  return (
    <HeroTabs
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey ?? items[0]?.key}
      onSelectionChange={(key) => onSelectionChange?.(String(key))}
      className={['w-full', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      <HeroTabs.ListContainer
        className={[
          stretch ? 'w-full max-w-full' : 'w-fit max-w-full',
          centered && !stretch ? 'mx-auto' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <HeroTabs.List
          className={[
            'gap-1 rounded-sm bg-soft p-1',
            stretch ? '!flex !w-full !min-w-0' : '!w-fit !min-w-0',
          ].join(' ')}
        >
          {items.map((item) => (
            <HeroTabs.Tab
              key={item.key}
              id={item.key}
              className={[
                'whitespace-nowrap rounded-sm px-3 py-2 text-sm text-brown-secondary',
                stretch
                  ? '!w-auto min-w-0 flex-1 justify-center text-center'
                  : '!w-auto flex-none min-w-[4.5rem]',
                selectedToneClass[tone],
              ].join(' ')}
            >
              {item.title}
            </HeroTabs.Tab>
          ))}
        </HeroTabs.List>
      </HeroTabs.ListContainer>
      {!listOnly
        ? items.map((item) => (
            <HeroTabs.Panel key={item.key} id={item.key} className="pt-4">
              {item.content}
            </HeroTabs.Panel>
          ))
        : null}
    </HeroTabs>
  );
}
