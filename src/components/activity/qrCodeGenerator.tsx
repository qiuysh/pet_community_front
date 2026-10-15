import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQRCode } from '../../api/activity';
import { QRCodeResponse } from '../../types/activity';
import { useToast } from '../../components/toast';
import { useAsyncEffect } from '../../hooks/useAsync';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

interface QRCodeGeneratorProps {
  activityId: number;
  onRefresh?: () => void;
}

export const QRCodeGenerator = ({ activityId, onRefresh }: QRCodeGeneratorProps) => {
  const toast = useToast();
  const { loading, refetch: refetchQR } = useAsyncEffect<QRCodeResponse>(
    () => generateQRCode(activityId),
    [activityId],
    {
      onSuccess: (data) => {
        setQrData(data);
        const expiresTime = new Date(data.expires).getTime();
        const remaining = Math.max(0, Math.floor((expiresTime - Date.now()) / 1000));
        setRemainingTime(remaining);
      },
      onError: (err) => toast.error((err as Error).message || '生成二维码失败'),
    },
  );
  const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!qrData) return;

    const expiresTime = new Date(qrData.expires).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresTime - now) / 1000));
      setRemainingTime(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        toast.warning('二维码已过期，请刷新');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Spinner label="生成二维码中..." />
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-error">生成二维码失败</div>
        <Button type="button" className="mt-2" onClick={refetchQR}>
          重新生成
        </Button>
      </div>
    );
  }

  const isExpired = remainingTime <= 0;

  return (
    <div className="flex flex-col items-center">
      <div className={`bg-white p-4 rounded-lg shadow-md ${isExpired ? 'opacity-50' : ''}`}>
        <QRCodeSVG 
          value={qrData.qrCode} 
          size={200} 
          level="H"
          bgColor="#FFFFFF"
          fgColor="#2B2F33"
        />
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm text-brown-muted">
          {isExpired ? (
            <span className="text-error font-medium">二维码已过期</span>
          ) : (
            <span>
              有效期剩余：<span className="font-medium text-primary">{remainingTime}秒</span>
            </span>
          )}
        </div>
        <div className="text-xs text-brown-muted mt-1">
          过期时间：{new Date(qrData.expires).toLocaleString('zh-CN')}
        </div>
      </div>

      <Button
        type="button"
        className="mt-4"
        onClick={() => {
          refetchQR();
          if (onRefresh) onRefresh();
        }}
      >
        刷新二维码
      </Button>

      <div className="mt-4 text-xs text-brown-muted">
        请使用手机扫描二维码进行签到
      </div>
    </div>
  );
};
