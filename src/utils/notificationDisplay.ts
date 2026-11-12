/** 把安全通知里的冗长 UA/IP 压成可读摘要，详情仍可展开 */

export function summarizeSecurityNotification(content: string): {
  summary: string;
  detail: string;
} {
  const detail = (content || '').trim();
  if (!detail) {
    return { summary: '新设备登录', detail: '' };
  }

  let browser = '未知浏览器';
  if (/Edg\//i.test(detail)) browser = 'Edge';
  else if (/Chrome\//i.test(detail) && !/Edg\//i.test(detail)) browser = 'Chrome';
  else if (/Firefox\//i.test(detail)) browser = 'Firefox';
  else if (/Safari\//i.test(detail) && !/Chrome\//i.test(detail)) browser = 'Safari';

  const regionMatch = detail.match(
    /([\u4e00-\u9fa5]{2,}(?:省|市|区|县|自治州)?[\u4e00-\u9fa5]*)/,
  );
  const region = regionMatch?.[1];

  const summary = region
    ? `新设备登录 · ${browser} · ${region}`
    : `新设备登录 · ${browser}`;

  return { summary, detail };
}
