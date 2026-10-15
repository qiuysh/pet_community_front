const defaultUserAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#DE9C82"/>
      <stop offset="100%" style="stop-color:#F0785A"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg)"/>
  <circle cx="100" cy="80" r="38" fill="#FFF0EB"/>
  <path d="M40 180 C40 130, 160 130, 160 180 L160 200 L40 200 Z" fill="#FFF0EB"/>
  <circle cx="88" cy="76" r="5" fill="#F0785A"/>
  <circle cx="112" cy="76" r="5" fill="#F0785A"/>
  <path d="M90 96 Q100 104 110 96" stroke="#F0785A" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>
`)}`;

const defaultPetAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#C5D1B8"/>
      <stop offset="100%" style="stop-color:#3D9B8F"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg)"/>
  <ellipse cx="100" cy="110" rx="55" ry="48" fill="#E6F4F2"/>
  <ellipse cx="55" cy="80" rx="18" ry="28" fill="#E6F4F2" transform="rotate(-20 55 80)"/>
  <ellipse cx="145" cy="80" rx="18" ry="28" fill="#E6F4F2" transform="rotate(20 145 80)"/>
  <circle cx="82" cy="100" r="7" fill="#2E7A70"/>
  <circle cx="118" cy="100" r="7" fill="#2E7A70"/>
  <ellipse cx="100" cy="120" rx="10" ry="7" fill="#3D9B8F"/>
  <path d="M100 127 Q100 135 92 138" stroke="#2E7A70" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M100 127 Q100 135 108 138" stroke="#2E7A70" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>
`)}`;

export const getDefaultUserAvatar = () => defaultUserAvatar;

export const getDefaultPetAvatar = () => defaultPetAvatar;

export const getUserAvatar = (avatar?: string | null) => {
  if (avatar && avatar.trim()) return avatar;
  return defaultUserAvatar;
};

export const getPetAvatar = (avatar?: string | null) => {
  if (avatar && avatar.trim()) return avatar;
  return defaultPetAvatar;
};
