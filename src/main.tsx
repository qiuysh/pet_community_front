import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { installImageFade } from './utils/imageFade';
import './styles/app.css';
import './styles/global.scss';

// 图片淡入依赖全局 load 监听，必须在首屏渲染前装好
installImageFade();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}