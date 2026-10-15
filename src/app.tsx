import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastProvider, useToast } from './components/toast';
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