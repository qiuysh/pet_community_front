import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Pause, Play } from 'lucide-react';
import { Spinner } from '../ui/spinner';
import { formatVoiceDuration } from '../../utils/format';

/** 同时只允许一条语音播放 */
let activeAudio: HTMLAudioElement | null = null;

export interface VoiceMessageBubbleProps {
  src: string;
  /** 语音时长（秒） */
  duration: number;
  isMine: boolean;
  pending?: boolean;
}

function resolveTotal(audio: HTMLAudioElement, fallback: number): number {
  if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
    return audio.duration;
  }
  return fallback > 0 ? fallback : 0;
}

/** 语音消息气泡：播放/暂停 + 可拖拽进度 + 时长 */
export function VoiceMessageBubble({ src, duration, isMine, pending = false }: VoiceMessageBubbleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (activeAudio === audio) activeAudio = null;
      audio?.pause();
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || pending) return;

    if (playing) {
      audio.pause();
      return;
    }
    if (activeAudio && activeAudio !== audio) {
      activeAudio.pause();
    }
    activeAudio = audio;
    void audio.play().catch((error) => {
      console.error('语音播放失败', error);
    });
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const total = resolveTotal(audio, duration);
    setProgress(total > 0 ? Math.min(1, audio.currentTime / total) : 0);
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || pending) return;
    const next = Number(event.target.value);
    if (!Number.isFinite(next)) return;
    const total = resolveTotal(audio, duration);
    if (total <= 0) return;
    audio.currentTime = Math.min(1, Math.max(0, next)) * total;
    setProgress(Math.min(1, Math.max(0, next)));
  };

  return (
    <div className={`voice-bubble${isMine ? ' voice-bubble--mine' : ''}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={handleTimeUpdate}
      />
      <button
        type="button"
        className="voice-play-btn"
        onClick={togglePlay}
        disabled={pending}
        aria-label={playing ? '暂停语音' : '播放语音'}
      >
        {pending ? <Spinner size="sm" /> : playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <label className="voice-progress">
        <span className="sr-only">语音进度</span>
        <input
          type="range"
          className="voice-progress__input"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          disabled={pending}
          onChange={handleSeek}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="拖拽调整语音进度"
        />
        <span className="voice-progress__bar" style={{ width: `${Math.round(progress * 100)}%` }} />
      </label>
      <span className="voice-duration">{formatVoiceDuration(duration)}</span>
    </div>
  );
}
