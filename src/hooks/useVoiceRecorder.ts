import { useCallback, useEffect, useRef, useState } from 'react';

/** 录音偏短视为误触（毫秒） */
const MIN_RECORD_MS = 800;
/** 计时刷新间隔 */
const TICK_MS = 200;

export interface VoiceRecordingResult {
  blob: Blob;
  /** 秒，1-60 */
  duration: number;
  mimeType: string;
}

export interface UseVoiceRecorderOptions {
  /** 最长录音秒数，默认 60 */
  maxSeconds?: number;
  onComplete: (result: VoiceRecordingResult, autoStopped: boolean) => void;
  onError?: (message: string) => void;
}

export interface UseVoiceRecorderReturn {
  recording: boolean;
  /** 正在申请麦克风权限 */
  starting: boolean;
  seconds: number;
  start: () => Promise<void>;
  stop: () => void;
  cancel: () => void;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

/**
 * 按住录音 hook
 *
 * 指针按下调 start()，松手调 stop()；达到 maxSeconds 自动停止并回调。
 * 浏览器需 HTTPS 或 localhost（getUserMedia 限制）。
 */
export function useVoiceRecorder({
  maxSeconds = 60,
  onComplete,
  onError,
}: UseVoiceRecorderOptions): UseVoiceRecorderReturn {
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** getUserMedia 未返回前就松手 */
  const releasedBeforeStartRef = useRef(false);
  /** 用户主动取消，丢弃本次数据 */
  const cancelledRef = useRef(false);
  /** 是否由时长上限触发停止 */
  const autoStoppedRef = useRef(false);

  const callbacksRef = useRef({ onComplete, onError });
  useEffect(() => {
    callbacksRef.current = { onComplete, onError };
  }, [onComplete, onError]);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const finish = useCallback((autoStopped: boolean) => {
    autoStoppedRef.current = autoStopped;
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      recorderRef.current = null;
      return;
    }
    recorder.stop();
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    finish(false);
    stopStream();
    setSeconds(0);
    setRecording(false);
    setStarting(false);
  }, [clearTimers, finish, stopStream]);

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined' ||
      !window.isSecureContext
    ) {
      callbacksRef.current.onError?.('当前环境不支持录音，请使用 HTTPS 或 localhost 访问');
      return;
    }

    setStarting(true);
    setSeconds(0);
    cancelledRef.current = false;
    autoStoppedRef.current = false;
    releasedBeforeStartRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (releasedBeforeStartRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        setStarting(false);
        return;
      }

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        const duration = Math.min(maxSeconds, Math.max(1, Math.round(elapsed / 1000)));
        const auto = autoStoppedRef.current;
        const cancelled = cancelledRef.current;

        chunksRef.current = [];
        recorderRef.current = null;
        clearTimers();
        stopStream();
        setRecording(false);
        setStarting(false);
        setSeconds(0);

        if (cancelled) return;
        if (blob.size === 0) {
          callbacksRef.current.onError?.('录音失败，请重试');
          return;
        }
        if (elapsed < MIN_RECORD_MS) {
          callbacksRef.current.onError?.('录音时间太短');
          return;
        }
        callbacksRef.current.onComplete({ blob, duration, mimeType: type }, auto);
      };

      startedAtRef.current = Date.now();
      recorder.start();
      setRecording(true);
      setStarting(false);

      tickTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setSeconds(Math.min(maxSeconds, Math.floor(elapsed / 1000)));
      }, TICK_MS);

      maxTimerRef.current = setTimeout(() => {
        finish(true);
      }, maxSeconds * 1000);
    } catch (error) {
      console.error('录音启动失败', error);
      recorderRef.current = null;
      setStarting(false);
      stopStream();
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'NotAllowedError') {
        callbacksRef.current.onError?.('麦克风权限未开启');
      } else if (name === 'NotFoundError') {
        callbacksRef.current.onError?.('未检测到麦克风');
      } else {
        callbacksRef.current.onError?.('无法开始录音');
      }
    }
  }, [clearTimers, finish, maxSeconds, stopStream]);

  const stop = useCallback(() => {
    if (!recorderRef.current) {
      // 麦克风权限还没返回（或录音未开始）：标记已松手，start 内部会自行放弃
      releasedBeforeStartRef.current = true;
      return;
    }
    finish(false);
  }, [finish]);

  // 卸载时放弃录音
  useEffect(
    () => () => {
      cancelledRef.current = true;
      clearTimers();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      recorderRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    },
    [clearTimers],
  );

  return { recording, starting, seconds, start, stop, cancel };
}
