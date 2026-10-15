// front/src/utils/crypto.ts
import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';

let publicKey = '';

export const setPublicKey = (key: string): void => {
    publicKey = formatPublicKey(key);
};

export const getPublicKey = (): string => publicKey;

const formatPublicKey = (key: string): string => {
    if (!key) return '';

    if (key.includes('-----BEGIN PUBLIC KEY-----')) {
        return key;
    }

    let formatted = key.replace(/\s+/g, '');
    const pemKey = `-----BEGIN PUBLIC KEY-----\n${formatted.match(/.{1,64}/g)?.join('\n') || formatted}\n-----END PUBLIC KEY-----`;
    return pemKey;
};

export const encryptRSA = (data: string): string => {
    if (!publicKey) {
        console.error('Public key not set');
        return data;
    }
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);
    return encryptor.encrypt(data) || data;
};

export const encrypt = (data: string): string => {
    return encryptRSA(data);
};

export const encryptPassword = (password: string, useRSA: boolean = true): string => {
    if (useRSA && publicKey) {
        return encryptRSA(password);
    }
    return sha256(password);
};

export const sha256 = (data: string): string => {
    return CryptoJS.SHA256(data).toString();
};

export const sha512 = (data: string): string => {
    return CryptoJS.SHA512(data).toString();
};

export const md5 = (data: string): string => {
    return CryptoJS.MD5(data).toString();
};

export const generateRandomKey = (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const generateUUID = (): string => {
    return CryptoJS.lib.WordArray.random(16).toString();
};

export const encryptObject = <T>(data: T): string => {
    const jsonString = JSON.stringify(data);
    return encrypt(jsonString);
};