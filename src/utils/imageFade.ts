/**
 * 图片淡入标记
 *
 * 给已加载完成的 <img> 加 .is-loaded（失败加 .is-error），
 * 由 styles/_motion.scss 里的 CSS 负责淡入，避免在 60+ 页面逐个改 <img>。
 *
 * 未执行本函数时 <html> 上没有 motion-ready 类，CSS 不生效 —— 图片照常显示。
 */

const LOADED = 'is-loaded';
const ERROR = 'is-error';

function mark(img: HTMLImageElement, className: string): void {
  if (!img.classList.contains(className)) {
    img.classList.add(className);
  }
}

function markIfSettled(img: HTMLImageElement): void {
  if (!img.complete) return;
  mark(img, img.naturalWidth > 0 ? LOADED : ERROR);
}

export function installImageFade(): void {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.add('motion-ready');

  // load / error 不冒泡，必须用捕获阶段监听，才能覆盖后插入的图片
  document.addEventListener(
    'load',
    (event) => {
      if (event.target instanceof HTMLImageElement) mark(event.target, LOADED);
    },
    true,
  );
  document.addEventListener(
    'error',
    (event) => {
      if (event.target instanceof HTMLImageElement) mark(event.target, ERROR);
    },
    true,
  );

  // 脚本执行前已经完成加载的图片不会再触发 load
  document.querySelectorAll('img').forEach(markIfSettled);

  // 命中缓存的图片插入 DOM 后可能不触发 load，补一次扫描
  if (typeof MutationObserver === 'undefined') return;
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node instanceof HTMLImageElement) {
          markIfSettled(node);
        } else {
          node.querySelectorAll('img').forEach(markIfSettled);
        }
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
