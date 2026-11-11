import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastProvider, useToast } from './components/toast';
import { useUserBootstrap } from './hooks/useUserBootstrap';
import { useSiteConfigBootstrap } from './hooks/useSiteConfigBootstrap';
import { registerToastCallback, unregisterToastCallback } from './utils/toastManager';
import { ensureCsrfToken } from './api/axios';

// 内部组件，用于注册toast回调
function ToastRegistration() {
  const { showToast } = useToast();

  useEffect(() => {
    // 注册toast回调
    registerToastCallback(showToast);

    // 组件卸载时取消注册
    return () => {
      unregisterToastCallback();
    };
  }, [showToast]);

  return null;
}

function CsrfBootstrap() {
  useEffect(() => {
    void ensureCsrfToken();
  }, []);
  return null;
}

// 主应用组件
function AppContent() {
  // token 持久化在 storage，刷新后需补拉一次用户资料，否则权限判断全部失效
  useUserBootstrap();
  // 站点名称/Logo/描述/备案号来自后台配置，挂载时补拉一次供标题与页脚使用
  useSiteConfigBootstrap();

  return (
    <>
      <CsrfBootstrap />
      <ToastRegistration />
      <RouterProvider router={router} />
    </>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}