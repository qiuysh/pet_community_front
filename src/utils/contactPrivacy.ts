/**
 * 联系方式脱敏（前端兜底，§4.11）
 *
 * 后端在游客视角已对寻宠/领养联系方式脱敏后再下发；本函数作为前端兜底，
 * 当后端因故返回完整手机号/微信号时再次脱敏，避免明文泄露给游客。
 *
 * 规则与后端 service.MaskContact 对齐：
 * - 空字符串原样返回。
 * - 长度 <=3：保留首字符 + `**`。
 * - 长度 4-7：保留前 2 + `****` + 末 1。
 * - 长度 >=11：保留前 3 + `****` + 末 4（适配手机号）。
 * - 其余：保留前 2 + 中间 `*` + 末 2。
 *
 * @param contact 原始联系方式
 * @param isLoggedIn 当前查看者是否已登录；登录用户返回原值
 */
export function maskContact(contact: string, isLoggedIn: boolean): string {
  if (!contact || isLoggedIn) {
    return contact;
  }
  const runes = Array.from(contact);
  const n = runes.length;
  if (n <= 3) {
    return `${runes[0]}**`;
  }
  if (n <= 7) {
    return `${runes[0]}${runes[1]}****${runes[n - 1]}`;
  }
  if (n >= 11) {
    return `${runes.slice(0, 3).join('')}****${runes.slice(n - 4).join('')}`;
  }
  const keepHead = 2;
  const keepTail = 2;
  const masked: string[] = [];
  masked.push(...runes.slice(0, keepHead));
  for (let i = 0; i < n - keepHead - keepTail; i += 1) {
    masked.push('*');
  }
  masked.push(...runes.slice(n - keepTail));
  return masked.join('');
}

/** 联系方式是否疑似完整手机号（11 位连续数字），用于回归守护判断 */
export function looksLikeFullPhone(contact: string): boolean {
  return /\d{11}/.test(contact);
}
