/**
 * R13：判断当前环境能否请求摄像头扫码。
 * localhost / 127.0.0.1 视为可用（即便非 HTTPS）；其它非安全上下文直接降级到手输。
 */
export function getCameraQrBlockReason(
  opts: {
    isSecureContext?: boolean;
    hostname?: string;
    hasGetUserMedia?: boolean;
  } = {},
): string | null {
  const hostname =
    opts.hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const secure =
    opts.isSecureContext ??
    (typeof window !== 'undefined' ? window.isSecureContext : false);
  const hasGum =
    opts.hasGetUserMedia ??
    (typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia);

  if (!secure && !isLocalhost) {
    return '当前环境非安全连接，无法打开摄像头，请粘贴签到码';
  }
  if (!hasGum) {
    return '当前浏览器不支持摄像头，请粘贴签到码';
  }
  return null;
}

/** 权限拒绝 / 无设备时的统一文案（验收口径） */
export const CAMERA_DENIED_HINT = '摄像头未开启，可粘贴签到码';

export function mapCameraErrorMessage(err: unknown): string {
  const name = (err as { name?: string } | null)?.name;
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return CAMERA_DENIED_HINT;
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return '未检测到摄像头，可粘贴签到码';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return '摄像头被占用，可粘贴签到码';
  }
  return CAMERA_DENIED_HINT;
}
