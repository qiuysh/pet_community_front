/** 较昨日环比文案与方向 */
export function dayOverDayChange(today: number, yesterday: number): {
  change: string;
  changeType: 'up' | 'down' | 'flat';
} {
  if (yesterday <= 0) {
    if (today <= 0) {
      return { change: '0%', changeType: 'flat' };
    }
    return { change: '+100%', changeType: 'up' };
  }
  const rate = ((today - yesterday) / yesterday) * 100;
  const rounded = Math.round(rate * 10) / 10;
  if (rounded === 0) {
    return { change: '0%', changeType: 'flat' };
  }
  const sign = rounded > 0 ? '+' : '';
  return {
    change: `${sign}${rounded}%`,
    changeType: rounded > 0 ? 'up' : 'down',
  };
}

export function formatCount(value: number | undefined | null): string {
  return (value ?? 0).toLocaleString('zh-CN');
}
