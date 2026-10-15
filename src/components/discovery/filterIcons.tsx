import type { ReactElement } from 'react';

interface PetIconProps {
  type: string;
  size?: number;
  color?: string;
}

interface PostIconProps {
  type: string;
  size?: number;
  color?: string;
}

export const PetIcon = ({ type, size = 16, color = 'currentColor' }: PetIconProps) => {
  const icons: Record<string, ReactElement> = {
    dog: (
      <>
        <path d="M10 6.5C9 5.5 7.5 5 6 5 4 5 2.5 6.5 2.5 8.5c0 3 2.5 5.5 5 7 2.5-1.5 5-4 5-7 0-2-1.5-3.5-3.5-3.5-1 0-1.8.4-2.5 1.5z" />
        <circle cx="7" cy="8" r="0.8" />
        <circle cx="9" cy="8" r="0.8" />
        <path d="M7 10c.5.5 1.5.5 2 0" />
      </>
    ),
    cat: (
      <>
        <path d="M12 14c-3.314 0-6-2.686-6-6 0-1 .5-2 1-3-.5 0-1-.5-1-1s.5-1 1.5-1c1 0 2 .5 3 1.5 1-1 2-1.5 3-1.5 1 0 1.5.5 1.5 1s-.5 1-1 1c.5 1 1 2 1 3 0 3.314-2.686 6-6 6z" />
        <circle cx="10" cy="9" r="0.8" />
        <circle cx="14" cy="9" r="0.8" />
        <path d="M11 12c.667.667 1.333.667 2 0" />
      </>
    ),
    bird: (
      <>
        <path d="M16 7.5a3.5 3.5 0 0 0-7 0c0 1.5.8 2.8 2 3.5v2l-2 2h10l-2-2v-2c1.2-.7 2-2 2-3.5z" />
        <path d="M12.5 10.5l1.5-1 1.5 1" />
        <circle cx="14" cy="6.5" r="0.6" />
      </>
    ),
    fish: (
      <>
        <path d="M2 12s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" />
        <path d="M18 12l4 3v-6l-4 3z" />
        <circle cx="14" cy="11" r="0.8" />
        <path d="M8 10c-1 1-1 3 0 4" />
      </>
    ),
    other: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v1M12 15v1M8 12h1M15 12h1" />
      </>
    ),
  };

  const paths = icons[type] || icons.other;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths}
    </svg>
  );
};

export const PostIcon = ({ type, size = 16, color = 'currentColor' }: PostIconProps) => {
  const icons: Record<string, ReactElement> = {
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </>
    ),
    video: (
      <>
        <rect x="2" y="5" width="15" height="14" rx="2" />
        <path d="M17 10l5-3v10l-5-3z" />
      </>
    ),
    text: (
      <>
        <path d="M4 6h16M4 12h16M4 18h10" />
      </>
    ),
  };

  const paths = icons[type] || icons.text;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths}
    </svg>
  );
};
