import { MarkRect } from '~/models/mark.js';

export default function scrollToRect(rect: MarkRect) {
  const { clientHeight, clientWidth, scrollHeight } = document.documentElement;
  let top: number;
  let left: number;
  if (rect.top < clientHeight / 2) {
    top = 0;
  } else if (rect.height > clientHeight) {
    top = rect.top - 20;
  } else {
    top = Math.floor((rect.top + rect.height / 2 - 20) - clientHeight / 2);
  }
  if (top + rect.height > scrollHeight) top = scrollHeight - rect.height;
  if (top < 0) top = 0;
  if (rect.left + rect.width <= clientWidth) {
    left = 0;
  } else {
    left = rect.left + rect.width - clientWidth;
  }
  window.scrollTo({ left, top, behavior: 'smooth' });
  // 首先看看 rect 是否是在整个窗口之内的
}
