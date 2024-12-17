import { MarkRect } from '~/models/mark.js';

export function isContainRect(
  { clientX, clientY }: { clientX: number; clientY: number },
  { left, width, top, height }: MarkRect,
): boolean {
  const offsetX = clientX + window.scrollX - left;
  if (offsetX < 0 || offsetX > width) return false;
  const offsetY = clientY + window.scrollY - top;
  if (offsetY < 0 || offsetY > height) return false;
  return true;
}

export function isEqualRect(a: MarkRect, b: MarkRect) {
  return a.top === b.top && a.left === b.left && a.height === b.height && a.width === b.width;
}

export function fixRect(rect: MarkRect) {
  if (rect.top < 0) rect.top = 0;
  else if (rect.top + rect.height > document.documentElement.scrollHeight) {
    rect.top = document.documentElement.scrollHeight - rect.height;
  }
  if (rect.left < 0) rect.left = 0;
  else if (rect.left + rect.width > document.documentElement.scrollWidth) {
    rect.left = document.documentElement.scrollWidth - rect.width;
  }
}
