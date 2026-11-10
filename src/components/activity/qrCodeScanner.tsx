import { useCallback } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { ICON_SIZE } from '../../styles/iconSize';
import { useQrScanner } from '../../hooks/useQrScanner';
import { getCameraQrBlockReason } from '../../utils/cameraQrCapability';
import { Button } from '../ui/button';

export interface QrCodeScannerProps {
  /** 扫到签到码后回调；组件内已 stop 相机 */
  onScan: (text: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

/**
 * R13 应用内摄像头扫码：用户手势启动，解码成功后释放视频流；不可用时只展示说明。
 */
export function QrCodeScanner({ onScan, onError, disabled }: QrCodeScannerProps) {
  const blockReason = getCameraQrBlockReason();

  const handleDetected = useCallback(
    (text: string) => {
      if (!text) return false;
      onScan(text);
      return true;
    },
    [onScan],
  );

  const { videoRef, scanning, starting, start, stop } = useQrScanner({
    onDetected: handleDetected,
    onError,
  });

  if (blockReason) {
    return (
      <div
        className="rounded-xl border border-border-light bg-soft px-4 py-3 text-sm text-brown-muted"
        data-testid="qr-scanner-blocked"
      >
        {blockReason}
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="qr-scanner">
      <div className="relative overflow-hidden rounded-xl bg-black aspect-[4/3]">
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${scanning ? 'block' : 'hidden'}`}
          playsInline
          muted
          autoPlay
        />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80 text-sm px-4 text-center">
            <Camera size={ICON_SIZE.nav} aria-hidden="true" />
            <span>点击下方按钮打开后置摄像头扫码</span>
          </div>
        )}
        {scanning && (
          <div className="pointer-events-none absolute inset-x-8 top-1/2 -translate-y-1/2 h-40 rounded-lg border-2 border-primary/80" />
        )}
      </div>

      <div className="flex gap-2">
        {!scanning ? (
          <Button
            type="button"
            variant="secondary"
            block
            disabled={disabled || starting}
            loading={starting}
            onClick={() => void start()}
            aria-label="打开摄像头扫码"
          >
            <Camera size={ICON_SIZE.inline} aria-hidden="true" />
            打开摄像头扫码
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            block
            onClick={stop}
            aria-label="关闭摄像头"
          >
            <CameraOff size={ICON_SIZE.inline} aria-hidden="true" />
            关闭摄像头
          </Button>
        )}
      </div>
    </div>
  );
}

export default QrCodeScanner;
