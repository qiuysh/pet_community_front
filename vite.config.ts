import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * 从模块 id 解析真实 npm 包名（取最后一个 node_modules 段）。
 * 不可用 id.includes('xxx')：pnpm 虚拟路径常含 peer 版本后缀，会误匹配。
 */
function getPackageName(id: string): string | undefined {
  const normalized = id.replace(/\\/g, '/');
  const marker = '/node_modules/';
  const idx = normalized.lastIndexOf(marker);
  if (idx === -1) return undefined;

  const rest = normalized.slice(idx + marker.length);
  if (rest.startsWith('@')) {
    const [scope, name] = rest.split('/');
    return name ? `${scope}/${name}` : scope;
  }
  return rest.split('/')[0];
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 共享运行时（React + HeroUI 等）自然体积较大；硬拆仅针对 ≥300KB 且场景隔离的依赖
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        /**
         * 硬拆策略：只拆本身 ≥300KB、且与前台路由隔离的包。
         * icons / router / axios / crypto / qrcode 等小包不硬拆，交给 Rollup 按引用自然分包。
         */
        manualChunks(id) {
          const pkg = getPackageName(id);
          if (!pkg) return;

          if (
            pkg === 'recharts' ||
            pkg.startsWith('d3-') ||
            pkg === 'victory-vendor' ||
            pkg === 'internmap' ||
            pkg === 'decimal.js-light'
          ) {
            return 'charts';
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      // 上传文件由后端 r.Static("/uploads", ...) 提供，开发环境需一并代理
      '/uploads': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
    },
  },
});
