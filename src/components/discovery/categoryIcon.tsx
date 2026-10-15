import type { ReactElement } from 'react';

interface CategoryIconProps {
  categoryName: string;
  size?: number;
  color?: string;
}

const iconPaths: Record<string, ReactElement> = {
  '萌宠日常': (
    <>
      <path d="M12 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" />
      <path d="M8 10c0-1.105.448-2 1-2s1 .895 1 2-.448 2-1 2-1-.895-1-2z" />
      <path d="M14 10c0-1.105.448-2 1-2s1 .895 1 2-.448 2-1 2-1-.895-1-2z" />
      <path d="M10 13c.667.667 1.333.667 2 0" />
      <path d="M5 6.5C4.5 6 3.8 5.8 3.5 6.3c-.3.5-.1 1.2.4 1.7.5.5 1.2.7 1.7.4.5-.3.7-1 .4-1.7-.1-.2-.3-.4-.6-.7z" />
      <path d="M19 6.5c.5-.6 1.2-.7 1.7-.4.5.3.7 1 .4 1.7-.3.5-1 .7-1.7.4-.5-.3-.7-1-.4-1.7.2-.3.4-.5.6-.7z" />
    </>
  ),
  '养宠知识': (
    <>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5v-15z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M8 7h8M8 10h8M8 13h5" />
    </>
  ),
  '宠物健康': (
    <>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      <path d="M12 8v6M9 11h6" />
    </>
  ),
  '搞笑萌宠': (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01M15 9h.01" />
      <path d="M8 5l-2 2M16 5l2 2" />
    </>
  ),
  '领养送养': (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
      <path d="M10 14h4M12 14v-3" />
    </>
  ),
  '宠物活动': (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
};

const defaultIcon = (
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </>
);

export const CategoryIcon = ({ categoryName, size = 28, color = 'currentColor' }: CategoryIconProps) => {
  const paths = iconPaths[categoryName] || defaultIcon;

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
