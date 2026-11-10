import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { ICON_SIZE } from '../../styles/iconSize';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import {
  drawSharePoster,
  downloadCanvasPng,
  posterCopyText,
  type SharePosterInput,
} from '../../utils/sharePoster';

export interface SharePosterModalProps {
  open: boolean;
  onClose: () => void;
  input: SharePosterInput | null;
  onGenerated?: () => void;
}

export function SharePosterModal({ open, onClose, input, onGenerated }: SharePosterModalProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!input || !qrRef.current) return;
    setLoading(true);
    setError('');
    try {
      // 等 QR 画完一帧
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const result = await drawSharePoster(input, qrRef.current);
      setCanvas(result);
      setPreviewUrl(result.toDataURL('image/png'));
      onGenerated?.();
    } catch (e) {
      console.error(e);
      setError((e as Error).message || '海报生成失败');
      setPreviewUrl(null);
      setCanvas(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      setCanvas(null);
      setError('');
      setLoading(false);
      return;
    }
    if (!input) return;
    const t = window.setTimeout(() => {
      void generate();
    }, 50);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, input?.url, input?.title, input?.coverUrl]);

  const handleDownload = () => {
    if (!canvas) return;
    downloadCanvasPng(canvas, `share-poster-${Date.now()}.png`);
    showSuccessToast('海报已保存');
  };

  const handleCopyText = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(posterCopyText(input));
      showSuccessToast('文案已复制');
    } catch {
      showErrorToast('复制失败，请手动选择文案');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="分享海报" size="md" footer={null}>
      {/* 离屏二维码源 */}
      <div className="sr-only" aria-hidden="true">
        {input?.url ? (
          <QRCodeCanvas
            ref={qrRef}
            value={input.url}
            size={280}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#2B2F33"
            includeMargin
          />
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-4">
        {loading && (
          <div className="flex flex-col items-center py-10 text-brown-muted">
            <Spinner />
            <p className="mt-3 text-sm">正在生成海报…</p>
          </div>
        )}

        {!loading && error && (
          <div className="w-full text-center py-8 space-y-3">
            <p className="text-sm text-error-text">{error}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => void generate()}>
              <RefreshCw size={ICON_SIZE.inline} aria-hidden="true" />
              重试
            </Button>
          </div>
        )}

        {!loading && previewUrl && (
          <>
            <img
              src={previewUrl}
              alt="分享海报预览"
              className="w-full max-w-[280px] rounded-md shadow-card border border-border-light"
            />
            <div className="flex w-full gap-2">
              <Button type="button" className="flex-1" onClick={handleDownload}>
                <Download size={ICON_SIZE.inline} aria-hidden="true" />
                保存图片
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => void handleCopyText()}>
                <Copy size={ICON_SIZE.inline} aria-hidden="true" />
                复制文案
              </Button>
            </div>
            <p className="text-xs text-brown-muted text-center">
              手机可长按预览图保存；桌面点击「保存图片」下载 PNG
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}

export default SharePosterModal;
