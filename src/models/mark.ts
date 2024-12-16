// 关于颜色, 之后另外训练!!!!!!!

export type Mark = ContainerMark | TextMark | ShapeMark | ImageMark;
export enum MarkType {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  CONTAINER = 'container',
}
export const MarkTypeNames: Record<MarkType, string> = {
  [MarkType.TEXT]: '文字',
  [MarkType.IMAGE]: '图片',
  [MarkType.SHAPE]: '形状',
  [MarkType.CONTAINER]: '容器',
  // 布局 容器
};

export interface TextMark {
  type: MarkType.TEXT;
  key: number;
  rect: MarkRect;
}

export interface ImageMark {
  type: MarkType.IMAGE;
  key: number;
  fixed: boolean;
  rect: MarkRect;
}

// 形状
export interface ShapeMark {
  type: MarkType.SHAPE;
  key: number;
  fixed: boolean;
  rect: MarkRect;
}
// 布局容器
export interface ContainerMark {
  type: MarkType.CONTAINER;
  key: number;
  fixed: boolean;
  control: MarkControl;
  rect: MarkRect;
}

export enum MarkControl {
  NONE = 'none',
  BUTTON = 'button',
}

export interface MarkRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
