import { MarkRect } from '../base/base.js';
import { getRect, roundRect } from '../base/rectUtils.js';
import isTransparentColor from '../isTransparentColor.js';
import { ContainerInstance, ImageInstance, Instance, InstanceType, ShapeInstance, TextInstance } from './instanceModels.js';

export function parseInstances(element: HTMLElement): Instance[] {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  const elementMark = createElementMark(element, rect);
  if (elementMark.type !== InstanceType.CONTAINER) return [elementMark];
  const output = createInnerMarks(element, rect, style);
  output.push(elementMark);
  return output;
}

function createElementMark(element: HTMLElement, rect: DOMRect): Instance {
  if (element.tagName === 'IMG') return createImage(rect);
  if (!hasVisibleChildren(element)) return createShape(rect);
  return createContainer(rect);
}

function createInnerMarks(element: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration): Instance[] {
  const array: Instance[] = [
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
function createTexts(element: HTMLElement): TextInstance[] {
  // 过滤掉纯粹的空格 <span>&nbsp;</span>
  const texts = Array.from(element.childNodes)
    .filter((x): x is Text => x.nodeType === Node.TEXT_NODE)
    .filter((x) => !isBlank(x.nodeValue));
  if (texts.length === 0) return [];
  const range = document.createRange();
  return texts.map((node): TextInstance => {
    range.selectNodeContents(node);
    const rect = getRect(range.getBoundingClientRect());
    return { type: InstanceType.TEXT, key: 0, rect };
  });
}

// 获取 单边border
function createBorders(rect: DOMRect, style: CSSStyleDeclaration): ShapeInstance[] {
  if (style.borderLeftWidth === style.borderTopWidth
    && style.borderLeftWidth === style.borderRightWidth
    && style.borderLeftWidth === style.borderBottomWidth) return [];
  const out: ShapeInstance[] = [];
  if (style.borderLeftWidth !== '0px' && !isTransparentColor(style.borderLeftColor)) {
    const size = parseFloat(style.borderLeftWidth);
    if (size > 0) out.push(border({
      y: rect.top + window.scrollY,
      x: rect.left + window.scrollX,
      w: size,
      h: rect.height,
    }));
  }
  if (style.borderRightWidth !== '0px' && !isTransparentColor(style.borderRightColor)) {
    const size = parseFloat(style.borderRightWidth);
    if (size > 0) out.push(border({
      y: rect.top + window.scrollY,
      x: rect.right + window.scrollX - size,
      w: size,
      h: rect.height,
    }));
  }
  if (style.borderTopWidth !== '0px' && !isTransparentColor(style.borderTopColor)) {
    const size = parseFloat(style.borderTopWidth);
    if (size > 0) out.push(border({
      y: rect.top + window.scrollY,
      x: rect.left + window.scrollX,
      w: rect.width,
      h: size,
    }));
  }

  if (style.borderBottomWidth !== '0px' && !isTransparentColor(style.borderBottomColor)) {
    const size = parseFloat(style.borderBottomWidth);
    if (size > 0) out.push(border({
      y: rect.bottom + window.scrollY - size,
      x: rect.left + window.scrollX,
      w: rect.width,
      h: size,
    }));
  }
  return out;
}

function border({ x: left, y: top, w: width, h: height }: MarkRect): ShapeInstance {
  return {
    type: InstanceType.SHAPE,
    key: 0,
    rect: roundRect({ x: left, y: top, w: width, h: height }),
  };
}

function createPseudo(element: HTMLElement, pseudo: '::after' | '::before'): Instance | null {
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
    type: style.backgroundImage === 'none' ? InstanceType.SHAPE : InstanceType.IMAGE,
    key: 0,
    rect: getRect(rect),
  };
}

// 获取border(我们无视)

function createShape(rect: DOMRect): ShapeInstance {
  return { type: InstanceType.SHAPE, key: 0, rect: getRect(rect) };
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

function createImage(rect: DOMRect): ImageInstance {
  return { type: InstanceType.IMAGE, key: 0, rect: getRect(rect) };
}

function createContainer(rect: DOMRect): ContainerInstance {
  return {
    type: InstanceType.CONTAINER,
    key: 0,
    rect: getRect(rect),
  };
}

function isBlank(text: string | null) {
  return !text || text.trim() === '';
}
