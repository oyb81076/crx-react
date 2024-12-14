import { ImageMark, LayoutMark, Mark, MarkControl, MarkLayout, MarkPosition, MarkState, MarkType, ShapeMark, TextMark } from '../../models/mark.js';
import { createKey } from '../atoms.js';

// text br text 应当要生成多个text
/**
 * 获取element下面的文字markets
 */
export function createTextMarks(element: HTMLElement): TextMark[] {
  // 过滤掉纯粹的空格 <span>&nbsp;</span>
  const texts = Array.from(element.childNodes)
    .filter((x): x is Text => x.nodeType === Node.TEXT_NODE)
    .filter((x) => !isBlank(x.nodeValue));
  if (texts.length === 0) return [];
  const range = document.createRange();
  return texts.map((node): TextMark => {
    range.selectNodeContents(node);
    const rect = getRect(range.getBoundingClientRect());
    const key = createKey();
    return { type: MarkType.TEXT, key, rect };
  });
}

export function createElementMark(element: HTMLElement, style: CSSStyleDeclaration): Exclude<Mark, TextMark> {
  const rect = element.getBoundingClientRect();
  if (element.tagName === 'IMG') {
    return createImageMark(rect);
  }
  if (!hasVisibleChildren(element)) {
    return createShapeMark(rect);
  }
  return createLayoutMark(element, rect, style);
}

function createShapeMark(rect: DOMRect): ShapeMark {
  return { type: MarkType.SHAPE, key: createKey(), rect: getRect(rect) };
}

function hasVisibleChildren(element: HTMLElement) {
  return Array.from(element.childNodes).some((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      // 获取样式信息
      const el = node as HTMLElement;
      const style = getComputedStyle(el);
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && parseFloat(style.opacity) > 0
        && (el.offsetWidth > 0 || el.offsetHeight > 0);
    }
    if (node.nodeType === Node.TEXT_NODE) {
      return !isBlank(node.nodeValue);
    }
    return false;
  });
}

// Layout / Shape / Text
// 万物分两种 Layout 和 Object
// Layout 分 Paragrpah, Grid, Horizonal, Vertical
// Object 分 Text Image(图片) Shape(纯色)

function createImageMark(rect: DOMRect): ImageMark {
  return { type: MarkType.IMAGE, key: createKey(), rect: getRect(rect) };
}

function createLayoutMark(element: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration): LayoutMark {
  return {
    type: MarkType.LAYOUT,
    key: createKey(),
    layout: getLayout(element, style),
    position: getPosition(style),
    state: MarkState.NONE,
    control: getControl(element),
    rect: getRect(rect),
  };
}

function getControl(element: HTMLElement): MarkControl {
  switch (element.tagName) {
    case 'A': return MarkControl.ANCHOR;
    case 'BUTTON': return MarkControl.BUTTON;
    default: return MarkControl.NONE;
  }
}

function getPosition(style: CSSStyleDeclaration): MarkPosition {
  switch (style.position) {
    case 'fixed': return MarkPosition.FIXED;
    case 'absolute': return MarkPosition.ABSOLUTE;
    default: return MarkPosition.STATIC;
  }
}

function getLayout(element: HTMLElement, style: CSSStyleDeclaration): MarkLayout {
  // 是不是有多行元素决定了是不是block
  if (element.childElementCount <= 1) return MarkLayout.PARAGRAPH;
  const display = style.display;
  if (display === 'grid') { return MarkLayout.GRID; }
  if (display === 'flex' && style.flexDirection.startsWith('row')) {
    return MarkLayout.HORIZONTAL;
  }
  return MarkLayout.VERTICAL;
}

function getRect(rect: DOMRect) {
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;
  const width = rect.width;
  const height = rect.height;
  return { top, left, width, height };
}

function isBlank(text: string | null) {
  return !text || text.trim() === '';
}
