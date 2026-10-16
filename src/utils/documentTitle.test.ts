import { describe, expect, it } from 'vitest';
import {
  ADMIN_DOCUMENT_TITLE,
  FRONT_DOCUMENT_TITLE,
  resolveDocumentTitle,
} from './documentTitle';

describe('resolveDocumentTitle', () => {
  it('前台路径使用社区标题', () => {
    expect(resolveDocumentTitle('/')).toBe(FRONT_DOCUMENT_TITLE);
    expect(resolveDocumentTitle('/posts/1')).toBe(FRONT_DOCUMENT_TITLE);
    expect(resolveDocumentTitle('/login')).toBe(FRONT_DOCUMENT_TITLE);
  });

  it('后台路径使用管理后台标题', () => {
    expect(resolveDocumentTitle('/admin/login')).toBe(ADMIN_DOCUMENT_TITLE);
    expect(resolveDocumentTitle('/admin/dashboard')).toBe(ADMIN_DOCUMENT_TITLE);
    expect(resolveDocumentTitle('/admin/settings')).toBe(ADMIN_DOCUMENT_TITLE);
  });
});
