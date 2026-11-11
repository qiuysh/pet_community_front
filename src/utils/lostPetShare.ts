/** 后端寻宠状态：1 寻找中，2 已找到，3 已结束 */
export const LOST_PET_STATUS = {
  searching: 1,
  found: 2,
  closed: 3,
} as const;

export const LOST_PET_STATUS_LABEL: Record<number, string> = {
  [LOST_PET_STATUS.searching]: '寻找中',
  [LOST_PET_STATUS.found]: '已找回',
  [LOST_PET_STATUS.closed]: '已结束',
};

export interface LostPetShareSource {
  petName: string;
  lostLocation: string;
  description?: string;
  status: number;
}

/**
 * R2 分享标题：寻找中用【寻宠】，已找回用【已找回】；描述截前 60 字附在标题后供微博等渠道使用。
 */
export function buildLostPetShareTitle(item: LostPetShareSource): string {
  const tag = item.status === LOST_PET_STATUS.found ? '已找回' : '寻宠';
  const head = `【${tag}】${item.petName} · ${item.lostLocation}`;
  const desc = (item.description ?? '').trim().slice(0, 60);
  return desc ? `${head}\n${desc}` : head;
}
