import type { ReactElement } from 'react';

interface SettingsIconProps {
  type: 'profile' | 'password' | 'privacy' | 'devices' | 'bindings';
  size?: number;
  color?: string;
}

export const SettingsIcon = ({ type, size = 20, color = 'currentColor' }: SettingsIconProps) => {
  const icons: Record<string, ReactElement> = {
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" />
      </>
    ),
    password: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        <circle cx="12" cy="16" r="1.5" />
      </>
    ),
    privacy: (
      <>
        <path d="M12 2L4 6v6c0 5.556 3.843 10.744 8 12 4.157-1.256 8-6.444 8-12V6l-8-4z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
    devices: (
      <>
        <rect x="3" y="5" width="13" height="13" rx="2" />
        <rect x="15" y="9" width="6" height="12" rx="1.5" />
        <path d="M7 22h5" />
        <path d="M9.5 19v3" />
      </>
    ),
    bindings: (
      <>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </>
    ),
  };

  const paths = icons[type] || icons.profile;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
};
