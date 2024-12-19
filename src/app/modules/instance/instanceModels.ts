import { MarkBase } from '../base/base.js';

// 关于颜色, 之后另外训练!!!!!!!
export type Instance = ContainerInstance | TextInstance | ShapeInstance | ImageInstance;
export enum InstanceType {
  TEXT = 0,
  IMAGE = 1,
  SHAPE = 2,
  CONTAINER = 3,
}
export const InstanceTypeNames: Record<InstanceType, string> = {
  [InstanceType.TEXT]: '文字',
  [InstanceType.IMAGE]: '图片',
  [InstanceType.SHAPE]: '形状',
  [InstanceType.CONTAINER]: '容器',
};

export interface TextInstance extends MarkBase {
  type: InstanceType.TEXT;
}

export interface ImageInstance extends MarkBase {
  type: InstanceType.IMAGE;
}

// 形状
export interface ShapeInstance extends MarkBase {
  type: InstanceType.SHAPE;
}

// 布局容器
export interface ContainerInstance extends MarkBase {
  type: InstanceType.CONTAINER;
}
