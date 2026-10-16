/** 前台 / 后台浏览器页签标题（易区分） */
export const FRONT_DOCUMENT_TITLE = '宠物社区 · 与宠友分享快乐时光';
export const ADMIN_DOCUMENT_TITLE = '管理后台 · 宠物社区';

export function resolveDocumentTitle(pathname: string): string {
  return pathname.startsWith('/admin') ? ADMIN_DOCUMENT_TITLE : FRONT_DOCUMENT_TITLE;
}
