import type { ReactNode } from 'react';
import { Modal as HeroModal } from '@heroui/react/modal';
import { Button } from './button';
import { useOverlayState } from './useOverlayState';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** 点击遮罩是否关闭，默认 true */
  dismissable?: boolean;
}

const sizeMap = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
  dismissable = true,
}: ModalProps) {
  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (next) => {
      if (!next) onClose();
    },
  });

  if (!open && !state.isOpen) {
    return null;
  }

  return (
    <HeroModal state={state}>
      {/* DialogTrigger 需要可按压子节点；受控场景用隐藏 trigger 满足要求 */}
      <HeroModal.Trigger className="sr-only" aria-hidden>
        <span />
      </HeroModal.Trigger>
      <HeroModal.Backdrop isDismissable={dismissable} variant="blur">
        <HeroModal.Container size={sizeMap[size]} placement="center">
          <HeroModal.Dialog className={['rounded-md shadow-medium bg-white', className].join(' ')}>
            <HeroModal.CloseTrigger
              aria-label="关闭"
              className={[
                // HeroUI 默认 text-muted 映射到本项目浅灰底色，X 几乎看不见
                '!bg-transparent !text-brown-secondary',
                'hover:!bg-soft hover:!text-brown',
                'data-[hovered=true]:!bg-soft data-[hovered=true]:!text-brown',
                'focus-visible:!ring-2 focus-visible:!ring-primary/30',
              ].join(' ')}
            />
            {title ? (
              <HeroModal.Header>
                <HeroModal.Heading className="text-brown text-lg font-semibold">
                  {title}
                </HeroModal.Heading>
              </HeroModal.Header>
            ) : null}
            <HeroModal.Body className="text-brown-secondary">{children}</HeroModal.Body>
            {footer !== undefined ? (
              <HeroModal.Footer>{footer}</HeroModal.Footer>
            ) : (
              <HeroModal.Footer>
                <Button variant="ghost" onClick={onClose}>
                  关闭
                </Button>
              </HeroModal.Footer>
            )}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  );
}
