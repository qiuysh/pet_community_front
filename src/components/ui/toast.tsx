/**
 * HeroUI Toast 适配：应用层统一走 toast / ToastProvider，勿在页面直接 import @heroui/react。
 */
import type { ReactNode } from 'react';
import { Toast as HeroToast, toast as heroToast } from '@heroui/react/toast';

export type AppToastType = 'success' | 'error' | 'warning' | 'info';

export function AppToastRegion() {
  return (
    <HeroToast.Provider
      placement="top end"
      maxVisibleToasts={4}
      width={360}
      aria-label="通知"
    />
  );
}

export function showAppToast(
  type: AppToastType,
  message: string,
  duration: number = 3000,
): string {
  const options = { timeout: duration > 0 ? duration : 0 };
  switch (type) {
    case 'success':
      return heroToast.success(message, options);
    case 'error':
      return heroToast.danger(message, options);
    case 'warning':
      return heroToast.warning(message, options);
    case 'info':
    default:
      return heroToast.info(message, options);
  }
}

export function closeAppToast(id: string) {
  heroToast.close(id);
}

export function clearAppToasts() {
  heroToast.clear();
}

export function AppToastProviderShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AppToastRegion />
      {children}
    </>
  );
}
