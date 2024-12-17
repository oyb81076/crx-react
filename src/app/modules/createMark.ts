import { ContainerMark, ImageMark, Mark, MarkControl, MarkRect, MarkType, ShapeMark, TextMark } from '../../models/mark.js';
import isTransparentColor from './isTransparentColor.js';

export function createInnerMarks(element: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration): Mark[] {
  const array: Mark[] = [
    ...createTexts(element),
    ...createBorders(rect, style),
  ];
  const before = createPseudo(element, '::before');
  const after = createPseudo(element, '::after');
  if (before) array.push(before);
  if (after) array.push(after);
  return array;
}
// text br text 应当要生成多个text
/**
 * 获取element下面的文字markets
 */
function createTexts(element: HTMLElement): TextMark[] {
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

// 获取 单边border
function createBorders(rect: DOMRect, style: CSSStyleDeclaration): ShapeMark[] {
  if (style.borderLeftWidth === style.borderTopWidth
    && style.borderLeftWidth === style.borderRightWidth
    && style.borderLeftWidth === style.borderBottomWidth) return [];
  const out: ShapeMark[] = [];
  if (style.borderLeftWidth !== '0px' && !isTransparentColor(style.borderLeftColor)) {
    const size = parseFloat(style.borderLeftWidth);
    if (size > 0) out.push(border({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: size,
      height: rect.height,
    }));
  }
  if (style.borderRightWidth !== '0px' && !isTransparentColor(style.borderRightColor)) {
    const size = parseFloat(style.borderRightWidth);
    if (size > 0) out.push(border({
      top: rect.top + window.scrollY,
      left: rect.right + window.scrollX - size,
      width: size,
      height: rect.height,
    }));
  }
  if (style.borderTopWidth !== '0px' && !isTransparentColor(style.borderTopColor)) {
    const size = parseFloat(style.borderTopWidth);
    if (size > 0) out.push(border({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: size,
    }));
  }

  if (style.borderBottomWidth !== '0px' && !isTransparentColor(style.borderBottomColor)) {
    const size = parseFloat(style.borderBottomWidth);
    if (size > 0) out.push(border({
      top: rect.bottom + window.scrollY - size,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: size,
    }));
  }
  return out;
}

function border({ left, top, width, height }: MarkRect): ShapeMark {
  return {
    type: MarkType.SHAPE,
    key: 0,
    fixed: false,
    rect: {
      top: round1(top),
      left: round1(left),
      width: round1(width),
      height: round1(height),
    },
  };
}

function createPseudo(element: HTMLElement, pseudo: '::after' | '::before'): Mark | null {
  const style = window.getComputedStyle(element, pseudo);
  if (style.content === 'none') return null;
  if (style.display === 'none') return null;
  if (style.visibility === 'hidden') return null;
  // 提取伪元素内容
  const content = style.content.replace(/^['"]|['"]$/g, ''); // 去掉引号

  // 动态创建一个临时元素来计算文字尺寸
  const temp = document.createElement('span');
  for (const s of style) temp.style.setProperty(s, style.getPropertyValue(s));
  // temp.style = style;
  temp.style.position = 'absolute';
  temp.textContent = content;
  if (pseudo === '::before') {
    element.prepend(temp);
  } else {
    element.append(temp);
  }
  const rect = temp.getBoundingClientRect();
  element.removeChild(temp);
  return {
    type: style.backgroundImage === 'none' ? MarkType.SHAPE : MarkType.IMAGE,
    fixed: false,
    key: 0,
    rect: getRect(rect),
  };
}

export function createElementMark(element: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration): Mark {
  if (element.tagName === 'IMG') return createImage(rect, style);
  if (!hasVisibleChildren(element)) return createShape(rect, style);
  return createContainer(element, rect, style);
}

// 获取border(我们无视)

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
