/** 动态发布定位（PostLocation，≠ 寻宠 lost_location / 领养 location） */

export interface PostGeoPoint {
  latitude: number;
  longitude: number;
}

export interface PostLocationValue {
  location: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PostPoiResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

const NOMINATIM = 'https://nominatim.openstreetmap.org';

function assertSecureContextForGeo(): void {
  if (typeof window === 'undefined') return;
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    throw new Error('定位需在 HTTPS 环境下使用，可改为搜索或手输地名');
  }
}

/** 浏览器定位 → 坐标 */
export function getCurrentPosition(): Promise<PostGeoPoint> {
  assertSecureContextForGeo();
  if (!navigator.geolocation) {
    return Promise.reject(new Error('当前设备不支持定位'));
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('未开启定位权限，可搜索或手输地名'));
        } else if (err.code === err.TIMEOUT) {
          reject(new Error('定位超时，请重试或改用手输'));
        } else {
          reject(new Error('定位失败，请改用搜索或手输'));
        }
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 },
    );
  });
}

function formatCoordLabel(lat: number, lng: number): string {
  return `当前位置 (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
}

/** 逆地理：无 Key 的公开 Nominatim；失败时回落坐标文案 */
export async function reverseGeocode(point: PostGeoPoint): Promise<string> {
  try {
    const url = new URL(`${NOMINATIM}/reverse`);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(point.latitude));
    url.searchParams.set('lon', String(point.longitude));
    url.searchParams.set('zoom', '16');
    url.searchParams.set('addressdetails', '0');
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return formatCoordLabel(point.latitude, point.longitude);
    const data = (await res.json()) as { display_name?: string; name?: string };
    const name = (data.name || data.display_name || '').trim();
    if (!name) return formatCoordLabel(point.latitude, point.longitude);
    return name.length > 100 ? name.slice(0, 100) : name;
  } catch {
    return formatCoordLabel(point.latitude, point.longitude);
  }
}

/** POI 关键词搜索（Nominatim）；失败返回空列表，由 UI 提示手输 */
export async function searchPostPois(keyword: string, limit = 6): Promise<PostPoiResult[]> {
  const q = keyword.trim();
  if (!q) return [];
  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const rows = (await res.json()) as Array<{
    display_name?: string;
    name?: string;
    lat?: string;
    lon?: string;
  }>;
  return (rows || [])
    .map((row) => {
      const latitude = Number(row.lat);
      const longitude = Number(row.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
      const displayName = (row.display_name || row.name || q).trim();
      const name = (row.name || displayName.split(',')[0] || q).trim();
      return {
        name: name.length > 100 ? name.slice(0, 100) : name,
        displayName: displayName.length > 120 ? `${displayName.slice(0, 120)}…` : displayName,
        latitude,
        longitude,
      };
    })
    .filter((x): x is PostPoiResult => !!x);
}

/** 打开系统地图（无嵌入 SDK） */
export function openSystemMap(opts: {
  latitude?: number | null;
  longitude?: number | null;
  label?: string;
}): void {
  const { latitude, longitude, label } = opts;
  if (latitude == null || longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return;
  }
  const q = encodeURIComponent(label || `${latitude},${longitude}`);
  const url = `https://maps.apple.com/?ll=${latitude},${longitude}&q=${q}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function hasPostCoordinates(
  latitude?: number | null,
  longitude?: number | null,
): boolean {
  return (
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export const emptyPostLocation = (): PostLocationValue => ({
  location: '',
  latitude: null,
  longitude: null,
});
