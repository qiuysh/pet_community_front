/**
 * E2E 上传类用例的测试文件。
 *
 * 文件在内存中构造，仓库不放二进制资源，避免二进制污染与路径依赖。
 */

/** 1×1 透明 PNG */
const TINY_PNG_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export interface TestFile {
    name: string;
    mimeType: string;
    buffer: Buffer;
}

/** 生成一张可通过后端格式校验的测试图片（默认 1×1 PNG） */
export function testImage(name = `e2e-${Date.now()}.png`): TestFile {
    return {
        name,
        mimeType: 'image/png',
        buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
    };
}
