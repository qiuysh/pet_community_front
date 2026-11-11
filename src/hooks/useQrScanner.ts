import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCameraQrBlockReason,
  mapCameraErrorMessage,
} from '../utils/cameraQrCapability';

export interface UseQrScannerOptions {
  /** 解码成功回调；返回 true 表示停止扫描（通常扫到即停） */
  onDetected: (text: string) => boolean | void;
  /** 启动前环境不可用 / 权限失败时的提示 */
  onError?: (message: string) => void;
}

export interface UseQrScannerResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  scanning: boolean;
  starting: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * 摄像头扫码：动态加载 jsQR，后置摄像头取流，隐藏页/卸载时 stop tracks。
 * 打开必须由用户手势触发（调用 start），禁止进页自动开。
 */
export function useQrScanner({ onDetected, onError }: UseQrScannerOptions): UseQrScannerResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const jsQRRef = useRef<typeof import('jsqr').default | null>(null);
  const detectRef = useRef(onDetected);
  const errorRef = useRef(onError);
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);

  detectRef.current = onDetected;
  errorRef.current = onError;

  const stopTracks = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    setScanning(false);
    setStarting(false);
  }, []);

  const stop = useCallback(() => {
    stopTracks();
  }, [stopTracks]);

  const tick = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w === 0 || h === 0) {
      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
      return;
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
      return;
    }
    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);

    try {
      if (!jsQRRef.current) {
        const mod = await import('jsqr');
        jsQRRef.current = mod.default;
      }
      const result = jsQRRef.current(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (result?.data) {
        const shouldStop = detectRef.current(result.data.trim());
        if (shouldStop !== false) {
          stopTracks();
          return;
        }
      }
    } catch {
      // 单帧解码失败忽略，继续下一帧
    }

    rafRef.current = requestAnimationFrame(() => {
      void tick();
    });
  }, [stopTracks]);

  const start = useCallback(async () => {
    const blocked = getCameraQrBlockReason();
    if (blocked) {
      errorRef.current?.(blocked);
      return;
    }

    stopTracks();
    setStarting(true);
    try {
      // 预加载解码器，避免首帧卡顿
      if (!jsQRRef.current) {
        const mod = await import('jsqr');
        jsQRRef.current = mod.default;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStarting(false);
        errorRef.current?.(mapCameraErrorMessage(new Error('video missing')));
        return;
      }
      video.srcObject = stream;
      await video.play();
      setScanning(true);
      setStarting(false);
      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
    } catch (err) {
      stopTracks();
      errorRef.current?.(mapCameraErrorMessage(err));
    }
  }, [stopTracks, tick]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') stopTracks();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', stopTracks);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', stopTracks);
      stopTracks();
    };
  }, [stopTracks]);

  return { videoRef, scanning, starting, start, stop };
}
