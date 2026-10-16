import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { AdminButton } from '../../components/admin/adminButton';
import { adminUi } from '../../styles/adminUi';
import { ADMIN_DOCUMENT_TITLE } from '../../utils/documentTitle';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';

/** 后台 404：未知 /admin/* 路径 */
export function AdminNotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `页面不存在 · ${ADMIN_DOCUMENT_TITLE}`;
  }, []);

  return (
    <div className={adminUi.page}>
      <div
        className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-24"
        role="status"
        aria-labelledby="admin-not-found-title"
      >
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-secondary-soft text-secondary"
          aria-hidden
        >
          <FileQuestion size={ICON_SIZE.empty} strokeWidth={iconStroke(ICON_SIZE.empty)} />
        </div>
        <p className="text-4xl font-bold tabular-nums text-secondary">404</p>
        <h1 id="admin-not-found-title" className={`${adminUi.pageTitle} mt-3`}>
          页面不存在
        </h1>
        <p className="mt-2 max-w-md text-sm text-brown-muted">
          该管理页地址无效，或功能入口已调整。请从侧栏重新进入，或返回驾驶舱。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <AdminButton type="button" variant="secondary" onClick={() => navigate('/admin/dashboard')}>
            返回驾驶舱
          </AdminButton>
          <AdminButton type="button" variant="outline" onClick={() => navigate(-1)}>
            返回上一页
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
