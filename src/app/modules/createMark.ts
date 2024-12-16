import { ContainerMark, ImageMark, Mark, MarkControl, MarkType, ShapeMark, TextMark } from '../../models/mark.js';

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
    return { type: MarkType.TEXT, key: 0, rect };
  });
}

export function createElementMark(element: HTMLElement, style: CSSStyleDeclaration): Exclude<Mark, TextMark> {
  const rect = element.getBoundingClientRect();
  if (element.tagName === 'IMG') {
    return createImage(rect, style);
  }
  if (!hasVisibleChildren(element)) {
    return createShape(rect, style);
  }
  return createContainer(element, rect, style);
}

function createShape(rect: DOMRect, style: CSSStyleDeclaration): ShapeMark {
  return { type: MarkType.SHAPE, key: 0, fixed: style.position === 'fixed', rect: getRect(rect) };
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

function createImage(rect: DOMRect, style: CSSStyleDeclaration): ImageMark {
  return { type: MarkType.IMAGE, key: 0, fixed: style.position === 'fixed', rect: getRect(rect) };
}

function createContainer(element: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration): ContainerMark {
  return {
    type: MarkType.CONTAINER,
    key: 0,
    fixed: style.position === 'fixed',
    control: getControl(element),
    rect: getRect(rect),
  };
}

function getControl(element: HTMLElement): MarkControl {
  switch (element.tagName) {
    case 'BUTTON': return MarkControl.BUTTON;
    default: return MarkControl.NONE;
  }
}

function getRect(rect: DOMRect) {
  const top = round1(rect.top + window.scrollY);
  const left = round1(rect.left + window.scrollX);
  const width = round1(rect.width);
  const height = round1(rect.height);
  return { top, left, width, height };
}

// 保留一位小数
function round1(n: number) {
  if (Number.isInteger(n)) return n;
  return Math.round(n * 10) / 10;
}

function isBlank(text: string | null) {
  return !text || text.trim() === '';
}
