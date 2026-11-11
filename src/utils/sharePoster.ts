/** R3：分享海报绘制（1080×1440 逻辑尺寸，2x 像素比输出） */

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1440;
export const POSTER_SCALE = 2;

export interface SharePosterInput {
  url: string;
  title: string;
  coverUrl?: string;
  authorName?: string;
  authorAvatar?: string;
  siteName: string;
}

const COLORS = {
  cream: '#F7F3EE',
  card: '#FFFFFF',
  ink: '#2B2F33',
  muted: '#6B7280',
  secondary: '#3FA68A',
  secondarySoft: '#E6F5F0',
  primary: '#F0785A',
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** 按最大行宽截断为最多 maxLines 行，末行加省略号 */
export function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const raw = (text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return [];
  const lines: string[] = [];
  let rest = raw;
  while (rest && lines.length < maxLines) {
    if (ctx.measureText(rest).width <= maxWidth) {
      lines.push(rest);
      break;
    }
    let lo = 0;
    let hi = rest.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (ctx.measureText(rest.slice(0, mid)).width <= maxWidth) lo = mid;
      else hi = mid - 1;
    }
    if (lo <= 0) lo = 1;
    const isLast = lines.length === maxLines - 1;
    let slice = rest.slice(0, lo);
    rest = rest.slice(lo);
    if (isLast && rest) {
      while (slice.length > 1 && ctx.measureText(`${slice}…`).width > maxWidth) {
        slice = slice.slice(0, -1);
      }
      lines.push(`${slice}…`);
      break;
    }
    lines.push(slice);
  }
  return lines;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, 24);
  ctx.clip();
  if (img) {
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  } else {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, COLORS.secondarySoft);
    grad.addColorStop(1, '#FFF5F0');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = COLORS.secondary;
    ctx.font = '600 48px "Segoe UI", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('喵星社区', x + w / 2, y + h / 2 + 16);
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * 绘制分享海报。qrCanvas 须已渲染好二维码（建议 ≥200px）。
 * 返回物理像素 2160×2880 的 canvas（逻辑 1080×1440 @2x）。
 */
export async function drawSharePoster(
  input: SharePosterInput,
  qrCanvas: HTMLCanvasElement,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = POSTER_WIDTH * POSTER_SCALE;
  canvas.height = POSTER_HEIGHT * POSTER_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }
  ctx.scale(POSTER_SCALE, POSTER_SCALE);

  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // 顶部蜜桃细条
  ctx.fillStyle = COLORS.primary;
  ctx.fillRect(0, 0, POSTER_WIDTH, 8);

  const pad = 56;
  const cardX = pad;
  const cardY = 48;
  const cardW = POSTER_WIDTH - pad * 2;
  const cardH = POSTER_HEIGHT - 48 - 56;

  ctx.fillStyle = COLORS.card;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  const [cover, avatar] = await Promise.all([
    loadImage(input.coverUrl || ''),
    loadImage(input.authorAvatar || ''),
  ]);

  const coverH = 620;
  drawCover(ctx, cover, cardX + 36, cardY + 36, cardW - 72, coverH);

  // 标题
  ctx.fillStyle = COLORS.ink;
  ctx.font = '600 44px "Segoe UI", "PingFang SC", sans-serif';
  ctx.textAlign = 'left';
  const titleLines = wrapTextLines(ctx, input.title || '精彩内容', cardW - 96, 2);
  let textY = cardY + 36 + coverH + 64;
  titleLines.forEach((line) => {
    ctx.fillText(line, cardX + 48, textY);
    textY += 56;
  });

  // 作者
  const authorY = textY + 28;
  const avSize = 56;
  const avX = cardX + 48;
  const avY = authorY - 40;
  ctx.save();
  ctx.beginPath();
  ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (avatar) {
    ctx.drawImage(avatar, avX, avY, avSize, avSize);
  } else {
    ctx.fillStyle = COLORS.secondarySoft;
    ctx.fillRect(avX, avY, avSize, avSize);
  }
  ctx.restore();
  ctx.fillStyle = COLORS.ink;
  ctx.font = '500 28px "Segoe UI", "PingFang SC", sans-serif';
  ctx.fillText(input.authorName || '宠友', avX + avSize + 16, authorY);

  // 右下角二维码
  const qrSize = 200;
  const qrX = cardX + cardW - 48 - qrSize;
  const qrY = cardY + cardH - 48 - qrSize - 48;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 16);
  ctx.fill();
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = COLORS.muted;
  ctx.font = '400 22px "Segoe UI", "PingFang SC", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('扫码查看', qrX + qrSize, qrY + qrSize + 32);

  // 底部站点名
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.secondary;
  ctx.font = '600 26px "Segoe UI", "PingFang SC", sans-serif';
  ctx.fillText(input.siteName || '宠物社区', cardX + 48, cardY + cardH - 40);

  return canvas;
}

export function posterCopyText(input: SharePosterInput): string {
  const title = (input.title || '').trim();
  const site = input.siteName || '宠物社区';
  return `${title}\n来自 ${site}\n${input.url}`;
}

export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
