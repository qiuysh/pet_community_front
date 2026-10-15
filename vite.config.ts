import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // react-dom 生产包本身常超过 500kB；页面已按路由拆分
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts')) return 'charts';
          if (id.includes('@heroui')) return 'heroui';
          if (id.includes('lucide-react')) return 'icons';
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            /[/\\](react|scheduler)[/\\]/.test(id)
          ) {
            return 'react-vendor';
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
    },
  },
});
