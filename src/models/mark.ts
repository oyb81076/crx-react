// 关于颜色, 之后另外训练!!!!!!!

export type Mark = LayoutMark | TextMark | ShapeMark | ImageMark;
export enum MarkType {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  LAYOUT = 'layout',
}

export interface TextMark {
  type: MarkType.TEXT;
  key: number;
  rect: MarkRect;
}

export interface ImageMark {
  type: MarkType.IMAGE;
  key: number;
  rect: MarkRect;
}

// 形状
export interface ShapeMark {
  type: MarkType.SHAPE;
  key: number;
  rect: MarkRect;
}
// 布局容器
export interface LayoutMark {
  type: MarkType.LAYOUT;
  key: number;
  layout: MarkLayout;
  position: MarkPosition;
  state: MarkState;
  control: MarkControl;
  rect: MarkRect;
}
export enum MarkLayout {
  PARAGRAPH = 'paragraph',
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  GRID = 'grid',
}
export enum MarkPosition {
  STATIC = 'static',
  ABSOLUTE = 'absolute',
  FIXED = 'fixed',
}

export enum MarkControl {
  NONE = 'none',
  BUTTON = 'button',
  ANCHOR = 'anchor',
}
export enum MarkState {
  NONE = 'none',
  NORMAL = 'normal',
  ACTIVE = 'active',
}

export interface MarkRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
