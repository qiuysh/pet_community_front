import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const encryptMock = vi.fn();
const setPublicKeyMock = vi.fn();

vi.mock('jsencrypt', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      setPublicKey: setPublicKeyMock,
      encrypt: encryptMock,
    })),
  };
});

import {
  sha256,
  md5,
  generateRandomKey,
  generateUUID,
  setPublicKey,
  getPublicKey,
  encryptPassword,
} from './crypto';

describe('crypto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setPublicKey('');
  });

  afterEach(() => {
    setPublicKey('');
  });

  describe('sha256', () => {
    it('应为相同输入生成一致的哈希', () => {
      const hash1 = sha256('password');
      const hash2 = sha256('password');
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('不同输入应生成不同哈希', () => {
      expect(sha256('password1')).not.toBe(sha256('password2'));
    });
  });

  describe('md5', () => {
    it('应为相同输入生成一致的哈希', () => {
      expect(md5('hello')).toBe(md5('hello'));
      expect(md5('hello')).toHaveLength(32);
    });
  });

  describe('generateRandomKey', () => {
    it('默认应生成 32 位随机字符串', () => {
      const key = generateRandomKey();
      expect(key).toHaveLength(32);
    });

    it('应支持自定义长度', () => {
      const key = generateRandomKey(16);
      expect(key).toHaveLength(16);
    });

    it('每次生成结果应不同', () => {
      expect(generateRandomKey()).not.toBe(generateRandomKey());
    });
  });

  describe('generateUUID', () => {
    it('应生成 32 位十六进制字符串', () => {
      const uuid = generateUUID();
      expect(uuid).toHaveLength(32);
      expect(uuid).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('setPublicKey / getPublicKey', () => {
    it('未设置时应返回空字符串', () => {
      expect(getPublicKey()).toBe('');
    });

    it('设置后应返回格式化后的公钥', () => {
      const key = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAabcd';
      setPublicKey(key);
      const stored = getPublicKey();
      expect(stored).toContain('-----BEGIN PUBLIC KEY-----');
      expect(stored).toContain('-----END PUBLIC KEY-----');
    });

    it('已是 PEM 格式的公钥应原样返回', () => {
      const pem = '-----BEGIN PUBLIC KEY-----\nabc\n-----END PUBLIC KEY-----';
      setPublicKey(pem);
      expect(getPublicKey()).toBe(pem);
    });
  });

  describe('encryptPassword', () => {
    it('未设置公钥时应回退到 sha256', () => {
      const password = 'User@123';
      expect(encryptPassword(password)).toBe(sha256(password));
    });

    it('设置公钥且启用 RSA 时应使用 RSA 加密', () => {
      const encrypted = 'encrypted-value';
      encryptMock.mockReturnValue(encrypted);

      setPublicKey('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAabcd');
      const result = encryptPassword('User@123');
      expect(result).toBe(encrypted);
      expect(encryptMock).toHaveBeenCalledWith('User@123');
    });

    it('RSA 加密失败时应返回原始数据', () => {
      encryptMock.mockReturnValue(null);

      setPublicKey('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAabcd');
      const result = encryptPassword('User@123');
      expect(result).toBe('User@123');
    });

    it('禁用 RSA 时应直接返回 sha256', () => {
      setPublicKey('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAabcd');
      const password = 'User@123';
      expect(encryptPassword(password, false)).toBe(sha256(password));
    });
  });
});
