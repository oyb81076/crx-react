import { Instance } from '~/app/modules/instance/instanceModels.js';

import { MarkRect } from '../modules/base/base.js';

// 判断一个形状是否有足够的尺寸容纳标题
export function isRectContainTitle({ w: width, h: height }: MarkRect) {
  return width > 30 && height > 14;
}

export function isMarkRight(rect: MarkRect) {
  return rect.x > document.documentElement.clientWidth - 50;
}

export function isMarkOutside(mark: Instance) {
  const rect = mark.rect;
  if (rect.y < 14) return false;
  return true;
  // if (mark.type !== MarkType.CONTAINER) return true;
  // if (rect.height < 30) return true;
  // if (rect.width < 50) return true;
  // return false;
}
