import { Download } from 'lucide-react';
import { exportLogs } from '../../api/admin';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { useAsync } from '../../hooks/useAsync';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { AdminButton } from './adminButton';

interface LogExportProps {
    userId: string;
    actionType: string;
    targetType: string;
    startTime: string;
    endTime: string;
}

export function LogExport({ userId, actionType, targetType, startTime, endTime }: LogExportProps) {
    const { loading, run } = useAsync();

    const handleExport = () => run(
        () => exportLogs({
            userId: userId ? parseInt(userId) : undefined,
            actionType: actionType || undefined,
            targetType: targetType || undefined,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
        }),
        (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `behavior_logs_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showSuccessToast('日志导出成功');
        },
        (err) => showErrorToast((err as Error).message || '导出失败'),
    );

    return (
        <AdminButton type="button" variant="secondary" onClick={handleExport} disabled={loading} loading={loading}>
            <Download
              size={ICON_SIZE.inline}
              strokeWidth={iconStroke(ICON_SIZE.inline)}
              className="mr-1.5"
              aria-hidden="true"
            />
            {loading ? '导出中…' : '导出日志'}
        </AdminButton>
    );
}
