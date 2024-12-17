import { MarkRect } from '~/models/mark.js';

export default function isContainRect(
  { clientX, clientY }: MouseEvent,
  { left, width, top, height }: MarkRect,
): boolean {
  const offsetX = clientX + window.scrollX - left;
  if (offsetX < 0 || offsetX > width) return false;
  const offsetY = clientY + window.scrollY - top;
  if (offsetY < 0 || offsetY > height) return false;
  return true;
}
