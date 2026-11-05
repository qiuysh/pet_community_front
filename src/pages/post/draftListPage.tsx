import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, FileEdit } from 'lucide-react';
import { getDraftList, deleteDraft } from '../../api/post';
import { useAsyncEffect } from '../../hooks/useAsync';
import { DraftInfo } from '../../types/post';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { BackButton } from '../../components/ui/backButton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ConfirmDialog } from '../../components/ui/confirmDialog';
import { Spinner } from '../../components/ui/spinner';
import { Skeleton } from '../../components/ui/skeleton';

export function DraftListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { loading, data, setData } = useAsyncEffect(
    () => getDraftList(page, pageSize),
    [page],
    { onError: () => showErrorToast('获取草稿失败') },
  );

  const drafts: DraftInfo[] = data?.list ?? [];
  const total = data?.total ?? 0;

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deleteDraft(id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              list: prev.list.filter((d) => d.id !== id),
              total: Math.max(0, prev.total - 1),
            }
          : prev,
      );
      showSuccessToast('草稿已删除');
      setDeleteTarget(null);
    } catch {
      showErrorToast('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-[var(--user-header-offset,56px)] z-10 bg-white border-b border-border-light">
        <div className="page-shell py-3 flex items-center justify-between">
          <BackButton className="-ml-2" />
          <h1 className="text-lg font-semibold text-brown">草稿箱</h1>
          <Link to="/posts/create" className="text-sm text-primary font-medium">
            写动态
          </Link>
        </div>
      </div>

      <div className="page-shell py-4 space-y-3">
        {loading && drafts.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Spinner label="加载中…" />
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-24" />
              </Card>
            ))}
          </div>
        ) : drafts.length === 0 ? (
          <p className="text-center text-brown-muted py-12">暂无草稿</p>
        ) : (
          drafts.map((draft) => (
            <Card key={draft.id} className="flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <p className="text-brown line-clamp-3 whitespace-pre-wrap">
                  {draft.content || '（无文字内容）'}
                </p>
                <p className="text-xs text-brown-muted mt-2">
                  更新于 {draft.updatedAt || draft.createdAt}
                </p>
              </div>
              <div className="flex flex-row gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-lg text-primary"
                  aria-label="继续编辑"
                  onClick={() => navigate(`/posts/drafts/${draft.id}`)}
                >
                  <FileEdit size={18} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-lg text-red-500"
                  aria-label="删除草稿"
                  onClick={() => setDeleteTarget(draft.id)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </Card>
          ))
        )}

        {total > page * pageSize && (
          <div className="text-center pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)}>
              加载更多
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除草稿？"
        description="删除后草稿内容将永久丢失，无法恢复。"
        confirmText="删除"
        loading={deleting}
        onConfirm={() => deleteTarget !== null && handleDelete(deleteTarget)}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
