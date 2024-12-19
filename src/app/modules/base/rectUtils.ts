import { MarkRect } from './base.js';

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

export function fixRect(rect: MarkRect): MarkRect {
  if (rect.top < 0) rect.top = 0;
  else if (rect.top + rect.height > document.documentElement.scrollHeight) {
    rect.top = document.documentElement.scrollHeight - rect.height;
  }
  if (rect.left < 0) rect.left = 0;
  else if (rect.left + rect.width > document.documentElement.scrollWidth) {
    rect.left = document.documentElement.scrollWidth - rect.width;
  }
  return rect;
}

export function getRect(rect: DOMRect) {
  return roundRect({
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  });
}

export function roundRect(rect: MarkRect) {
  return {
    top: round(rect.top),
    left: round(rect.left),
    width: round(rect.width),
    height: round(rect.height),
  };
}

// 保留一位小数
function round(n: number) {
  if (Number.isInteger(n)) return n;
  return Math.round(n * 10) / 10;
}

export function markSort(a: { key: number; rect: MarkRect }, b: { key: number; rect: MarkRect }): number {
  const c0 = a.rect.width * a.rect.height - b.rect.width * b.rect.height;
  if (c0 !== 0) return c0;
  return b.key - a.key;
}
