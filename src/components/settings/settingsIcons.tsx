import { Link2, Lock, MonitorSmartphone, ShieldCheck, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';

interface SettingsIconProps {
  type: 'profile' | 'password' | 'privacy' | 'devices' | 'bindings';
  size?: number;
  color?: string;
  className?: string;
}

const ICONS: Record<SettingsIconProps['type'], LucideIcon> = {
  profile: User,
  password: Lock,
  privacy: ShieldCheck,
  devices: MonitorSmartphone,
  bindings: Link2,
};

export const SettingsIcon = ({
  type,
  size = ICON_SIZE.action,
  color = 'currentColor',
  className,
}: SettingsIconProps) => {
  const Icon = ICONS[type] || ICONS.profile;
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={iconStroke(size)}
      className={className}
      aria-hidden="true"
    />
  );
};
