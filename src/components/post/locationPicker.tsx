import { useState } from 'react';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Modal } from '../ui/modal';
import { Spinner } from '../ui/spinner';
import {
  emptyPostLocation,
  getCurrentPosition,
  reverseGeocode,
  searchPostPois,
  type PostLocationValue,
  type PostPoiResult,
} from '../../utils/postLocation';

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  value: PostLocationValue;
  onChange: (next: PostLocationValue) => void;
}

/**
 * 动态发布定位选点器（PostLocation）。
 * 能力：当前位置 / POI 搜索 / 手输文案 / 清除。无地图 SDK（逆地理与搜索走公开 Nominatim）。
 */
export function LocationPicker({ open, onClose, value, onChange }: LocationPickerProps) {
  const [manual, setManual] = useState(value.location);
  const [keyword, setKeyword] = useState('');
  const [pois, setPois] = useState<PostPoiResult[]>([]);
  const [busy, setBusy] = useState<'geo' | 'search' | null>(null);
  const [error, setError] = useState('');

  const apply = (next: PostLocationValue) => {
    onChange(next);
    setManual(next.location);
    setError('');
  };

  const handleUseCurrent = async () => {
    setBusy('geo');
    setError('');
    try {
      const point = await getCurrentPosition();
      const label = await reverseGeocode(point);
      apply({
        location: label,
        latitude: point.latitude,
        longitude: point.longitude,
      });
    } catch (e) {
      setError((e as Error).message || '定位失败');
    } finally {
      setBusy(null);
    }
  };

  const handleSearch = async () => {
    setBusy('search');
    setError('');
    try {
      const list = await searchPostPois(keyword);
      setPois(list);
      if (list.length === 0) {
        setError('未找到地点，可手输地名后点「使用文案」');
      }
    } catch {
      setError('搜索失败，可手输地名');
      setPois([]);
    } finally {
      setBusy(null);
    }
  };

  const handleUseManual = () => {
    const text = manual.trim();
    if (!text) {
      apply(emptyPostLocation());
      onClose();
      return;
    }
    apply({
      location: text.slice(0, 100),
      latitude: value.latitude,
      longitude: value.longitude,
    });
    onClose();
  };

  const handlePickPoi = (poi: PostPoiResult) => {
    apply({
      location: poi.name.slice(0, 100),
      latitude: poi.latitude,
      longitude: poi.longitude,
    });
    onClose();
  };

  const handleClear = () => {
    apply(emptyPostLocation());
    setPois([]);
    setKeyword('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="选择位置"
      placement="bottom"
      footer={
        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={handleClear}>
            清除定位
          </Button>
          <Button type="button" variant="secondary" onClick={handleUseManual}>
            使用文案
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Button
          type="button"
          className="w-full"
          disabled={busy === 'geo'}
          onClick={handleUseCurrent}
        >
          {busy === 'geo' ? (
            <Spinner size="sm" label="定位中…" />
          ) : (
            <>
              <Navigation size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
              <span className="ml-2">使用当前位置</span>
            </>
          )}
        </Button>

        <div>
          <label className="text-sm text-brown-secondary mb-1 block">手输地名</label>
          <Input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="例如：滨江宠物公园…"
            maxLength={100}
            aria-label="手输地名"
          />
        </div>

        <div>
          <label className="text-sm text-brown-secondary mb-1 block">搜索地点</label>
          <div className="flex gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="关键词…"
              aria-label="搜索地点关键词"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSearch();
                }
              }}
            />
            <Button type="button" variant="secondary" disabled={busy === 'search'} onClick={handleSearch}>
              {busy === 'search' ? (
                <Spinner size="sm" />
              ) : (
                <Search size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
              )}
            </Button>
          </div>
          {pois.length > 0 && (
            <ul className="mt-2 max-h-48 overflow-auto divide-y divide-cream-dark rounded-md border border-cream-dark">
              {pois.map((poi) => (
                <li key={`${poi.latitude}-${poi.longitude}-${poi.name}`}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-cream"
                    onClick={() => handlePickPoi(poi)}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={ICON_SIZE.inline}
                        strokeWidth={iconStroke(ICON_SIZE.inline)}
                        className="mt-0.5 shrink-0 text-primary-text"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="page-section-title block">{poi.name}</span>
                        <span className="text-xs text-brown-muted">{poi.displayName}</span>
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-error-text">{error}</p>}

        {value.location && (
          <p className="text-xs text-brown-muted flex items-center gap-1">
            <MapPin size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
            当前：{value.location}
            {value.latitude != null && value.longitude != null
              ? ` · ${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`
              : ' · 无坐标'}
            <button type="button" className="ml-auto text-brown-secondary" onClick={() => setManual('')} aria-label="清空手输">
              <X size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} />
            </button>
          </p>
        )}
      </div>
    </Modal>
  );
}
