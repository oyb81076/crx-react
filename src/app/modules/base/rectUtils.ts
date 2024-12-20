import { MarkRect } from './base.js';

export function isContainRect(
  { clientX, clientY }: { clientX: number; clientY: number },
  { x: left, w: width, y: top, h: height }: MarkRect,
): boolean {
  const offsetX = clientX + window.scrollX - left;
  if (offsetX < 0 || offsetX > width) return false;
  const offsetY = clientY + window.scrollY - top;
  if (offsetY < 0 || offsetY > height) return false;
  return true;
}

export function isEqualRect(a: MarkRect, b: MarkRect) {
  return a.y === b.y && a.x === b.x && a.h === b.h && a.w === b.w;
}

export function fixRect(rect: MarkRect): MarkRect {
  if (rect.y < 0) rect.y = 0;
  else if (rect.y + rect.h > document.documentElement.scrollHeight) {
    rect.y = document.documentElement.scrollHeight - rect.h;
  }
  if (rect.x < 0) rect.x = 0;
  else if (rect.x + rect.w > document.documentElement.scrollWidth) {
    rect.x = document.documentElement.scrollWidth - rect.w;
  }
  return rect;
}

export function getRect(rect: DOMRect) {
  return roundRect({
    y: rect.top + window.scrollY,
    x: rect.left + window.scrollX,
    w: rect.width,
    h: rect.height,
  });
}

export function roundRect(rect: MarkRect): MarkRect {
  return {
    y: round(rect.y),
    x: round(rect.x),
    w: round(rect.w),
    h: round(rect.h),
  };
}

// 保留一位小数
function round(n: number) {
  if (Number.isInteger(n)) return n;
  return Math.round(n * 10) / 10;
}

export function markSort(a: { key: number; rect: MarkRect }, b: { key: number; rect: MarkRect }): number {
  const c0 = a.rect.w * a.rect.h - b.rect.w * b.rect.h;
  if (c0 !== 0) return c0;
  return b.key - a.key;
}
