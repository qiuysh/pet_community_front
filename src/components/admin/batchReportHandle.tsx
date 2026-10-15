import { useState } from 'react';
import type { ReportHandleAction } from '../../types/admin';
import { batchHandleAdminReports } from '../../api/admin';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { useAsync } from '../../hooks/useAsync';
import { AdminButton } from './adminButton';
import { AdminFilterRadio } from './adminFilterRadio';
import { AdminLabel, AdminTextarea } from './adminField';
import { adminUi } from '../../styles/adminUi';

interface BatchReportHandleProps {
  selectedIds: number[];
  onSuccess: () => void;
  onCancel: () => void;
}

const ACTIONS: { value: ReportHandleAction; label: string; desc: string }[] = [
  { value: 'approve', label: '全部通过', desc: '下架相关内容' },
  { value: 'warn', label: '全部警告', desc: '通知内容作者' },
  { value: 'reject', label: '全部忽略', desc: '驳回举报' },
];

export function BatchReportHandle({ selectedIds, onSuccess, onCancel }: BatchReportHandleProps) {
  const [action, setAction] = useState<ReportHandleAction>('approve');
  const [result, setResult] = useState('');
  const { loading, run } = useAsync();

  const handleSubmit = () => {
    run(
      () => batchHandleAdminReports({
        ids: selectedIds,
        action,
        result: result.trim() || undefined,
      }),
      () => {
        const label = ACTIONS.find((a) => a.value === action)?.label ?? '处理';
        showSuccessToast(`已${label.replace('全部', '')} ${selectedIds.length} 条举报`);
        onSuccess();
      },
      (err) => showErrorToast((err as Error).message || '批量处理失败'),
    );
  };

  return (
    <div className={adminUi.overlay}>
      <div className={adminUi.modalDialog}>
        <div className="px-6 py-4 border-b border-border-light">
          <h3 className="text-lg font-semibold text-brown">批量处理举报</h3>
          <p className="text-sm text-brown-muted mt-1">已选择 {selectedIds.length} 条记录</p>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <AdminLabel className="mb-2">处理操作</AdminLabel>
            <AdminFilterRadio
              aria-label="批量处理操作"
              items={ACTIONS.map((item) => ({ key: item.value, label: item.label }))}
              value={action}
              onChange={(key) => setAction(key as ReportHandleAction)}
            />
            <p className="text-xs text-brown-muted mt-2">
              {ACTIONS.find((a) => a.value === action)?.desc}
            </p>
          </div>

          <div className="mb-4">
            <AdminLabel>处理说明（可选）</AdminLabel>
            <AdminTextarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="统一处理说明"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex items-center gap-3">
            <AdminButton type="button" variant="outline" className="flex-1" onClick={onCancel}>
              取消
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={loading}
              loading={loading}
              onClick={handleSubmit}
            >
              {loading ? '处理中…' : '确认批量处理'}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}
