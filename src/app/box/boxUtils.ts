import { Mark, MarkRect } from '~/models/mark.js';

export function isMarkRight(rect: MarkRect) {
  return rect.left > document.documentElement.clientWidth - 50;
}

export function isMarkOutside(mark: Mark) {
  const rect = mark.rect;
  if (rect.top < 14) return false;
  return true;
  // if (mark.type !== MarkType.CONTAINER) return true;
  // if (rect.height < 30) return true;
  // if (rect.width < 50) return true;
  // return false;
}
