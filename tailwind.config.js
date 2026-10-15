/** @type {import('tailwindcss').Config} */
export default {
  // 显式声明暗色模式为 class 触发，避免基于系统偏好自动应用 dark: 变体
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 蜜桃·青竹 — 与 _variables.scss / global :root 色值保持同步
        // 使用 hex 以支持 Tailwind 透明度修饰（bg-primary/20 等）
        primary: {
          DEFAULT: '#F0785A',
          light: '#F59A82',
          dark: '#D45E42',
          soft: '#FFF0EB',
        },
        secondary: {
          DEFAULT: '#3D9B8F',
          light: '#6BB5AB',
          dark: '#2E7A70',
          soft: '#E6F4F2',
        },
        // 管理后台侧栏实色底（勿用透明度，避免透底感）
        'admin-sidebar': '#E8ECEE',
        // 保留 cream / brown 键名以兼容已有类名
        cream: '#F4F7F7',
        soft: '#FBFCFC',
        muted: '#E6EAED',
        brown: {
          DEFAULT: '#2B2F33',
          secondary: '#5C6370',
          muted: '#8B929A',
          light: '#B0B6BE',
        },
        border: '#E0E6E8',
        'border-light': '#EDF1F2',
        success: {
          DEFAULT: '#2F9B7A',
          dark: '#248A6A',
          soft: '#E8F6F1',
        },
        warning: '#E6A23C',
        error: {
          DEFAULT: '#D94A4A',
          dark: '#C03D3D',
        },
        info: '#5B8DEF',
        rank: {
          gold: '#F0B429',
          silver: '#A0A6AD',
          bronze: '#C4895A',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', 'sans-serif'],
      },
      // 圆角角色：sm=控件 / md=卡片 / lg=弹层 / xl=大容器
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(43, 47, 51, 0.06)',
        medium: '0 8px 30px rgba(43, 47, 51, 0.10)',
        card: '0 2px 16px rgba(43, 47, 51, 0.04), 0 4px 8px rgba(43, 47, 51, 0.03)',
        hover: '0 6px 24px rgba(43, 47, 51, 0.08), 0 8px 12px rgba(43, 47, 51, 0.05)',
        brand: '0 4px 16px rgba(240, 120, 90, 0.28)',
        'brand-hover': '0 6px 22px rgba(240, 120, 90, 0.34)',
        focus: '0 0 0 3px rgba(240, 120, 90, 0.25)',
      },
      ringColor: {
        DEFAULT: '#F0785A',
      },
      ringOffsetColor: {
        DEFAULT: '#FFFFFF',
      },
      spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideIn: 'slideIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
