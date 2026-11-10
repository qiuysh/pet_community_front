import { describe, expect, it } from 'vitest';
import {
  CAMERA_DENIED_HINT,
  getCameraQrBlockReason,
  mapCameraErrorMessage,
} from './cameraQrCapability';

describe('getCameraQrBlockReason', () => {
  it('非安全上下文且非 localhost 时拦截', () => {
    expect(
      getCameraQrBlockReason({
        isSecureContext: false,
        hostname: 'example.com',
        hasGetUserMedia: true,
      }),
    ).toMatch(/非安全连接/);
  });

  it('localhost 即使非 secureContext 也允许', () => {
    expect(
      getCameraQrBlockReason({
        isSecureContext: false,
        hostname: 'localhost',
        hasGetUserMedia: true,
      }),
    ).toBeNull();
  });

  it('无 getUserMedia 时拦截', () => {
    expect(
      getCameraQrBlockReason({
        isSecureContext: true,
        hostname: 'example.com',
        hasGetUserMedia: false,
      }),
    ).toMatch(/不支持摄像头/);
  });
});

describe('mapCameraErrorMessage', () => {
  it('权限拒绝用验收文案', () => {
    expect(mapCameraErrorMessage({ name: 'NotAllowedError' })).toBe(CAMERA_DENIED_HINT);
  });
});
