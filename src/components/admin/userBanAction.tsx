import { useState } from 'react';
import { banFrontUser, unbanFrontUser } from '../../api/admin';
import { AdminButton } from './adminButton';
import { AdminLabel, AdminTextarea } from './adminField';
import { adminActionClass, adminUi } from '../../styles/adminUi';

interface UserBanActionProps {
    userId: number;
    userName: string;
    isBanned: boolean;
    onSuccess: () => void;
}

export function UserBanAction({ userId, userName, isBanned, onSuccess }: UserBanActionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setReason('');
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setReason('');
        setError('');
    };

    const handleSubmit = async () => {
        if (!isBanned && !reason.trim()) {
            setError('请填写封禁原因');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (isBanned) {
                await unbanFrontUser(userId);
            } else {
                await banFrontUser(userId, { reason: reason.trim() });
            }
            handleCloseModal();
            onSuccess();
        } catch (err: unknown) {
            let errorMessage = isBanned ? '解封失败' : '封禁失败';
            if (err instanceof Error) {
                errorMessage = err.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AdminButton variant="ghost"
                type="button"
                onClick={handleOpenModal}
                className={adminActionClass(isBanned ? 'success' : 'danger')}
            >
                {isBanned ? '解封' : '封禁'}
            </AdminButton>

            {isModalOpen && (
                <div className={adminUi.overlay}>
                    <div className={adminUi.modalDialog}>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    isBanned ? 'bg-success/10' : 'bg-error/10'
                                }`}>
                                    <svg className={`w-6 h-6 ${isBanned ? 'text-success' : 'text-error'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {isBanned ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        )}
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-brown">
                                        {isBanned ? '确认解封' : '确认封禁'}
                                    </h3>
                                    <p className="text-sm text-brown-muted">
                                        {isBanned ? '账号将恢复正常使用' : '账号将无法登录系统'}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-brown-secondary mb-4">
                                确定要{isBanned ? '解封' : '封禁'}用户「{userName}」吗？
                            </p>

                            {!isBanned && (
                                <div className="mb-4">
                                    <AdminLabel required>封禁原因</AdminLabel>
                                    <AdminTextarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="请输入封禁原因，该原因将记录到操作日志中"
                                        rows={3}
                                        invalid={!!error && !reason.trim()}
                                    />
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 px-4 py-3 bg-error/5 border border-error/20 rounded-md text-error text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <AdminButton
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseModal}
                                    disabled={isLoading}
                                >
                                    取消
                                </AdminButton>
                                <AdminButton
                                    type="button"
                                    variant={isBanned ? 'secondary' : 'danger'}
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    loading={isLoading}
                                >
                                    {isLoading ? '处理中…' : '确认'}
                                </AdminButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
