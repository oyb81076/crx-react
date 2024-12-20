import { MarkRect } from './base.js';

// 将屏幕滚动到某个区域
export default function scrollToRect(rect: MarkRect) {
  const { clientHeight, clientWidth, scrollHeight } = document.documentElement;
  let top: number;
  let left: number;
  if (rect.y < clientHeight / 2) {
    top = 0;
  } else if (rect.h > clientHeight) {
    top = rect.y - 20;
  } else {
    top = Math.floor((rect.y + rect.h / 2 - 20) - clientHeight / 2);
  }
  if (top + rect.h > scrollHeight) top = scrollHeight - rect.h;
  if (top < 0) top = 0;
  if (rect.x + rect.w <= clientWidth) {
    left = 0;
  } else {
    left = rect.x + rect.w - clientWidth;
  }
  window.scrollTo({ left, top, behavior: 'smooth' });
  // 首先看看 rect 是否是在整个窗口之内的
}
