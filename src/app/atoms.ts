import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { Instance } from '~/app/modules/instance/instanceModels.js';

import { instanceConfig } from './modules/instance/instanceConfig.js';
import { createSessionStorage } from './modules/sessionStorage.js';

// 为了避免数据, 其实还需要登陆功能

// 怎么处理storage????? window.location.hash

const KEY = 'crx::';
const KEY_PREFIX = KEY + window.location.pathname + window.location.search + '::';

// 根据不同的tag会有不同的mark
export const marksAtom = atomWithStorage<Instance[]>(
  KEY_PREFIX + 'marks', [], createSessionStorage(),
);
export const historyAtom = atom<{ idx: number; array: Instance[][] } | null>(null);
export const configAtom = atom(instanceConfig);

export enum OrderBy { KEY, POSITION }
export enum Order { ASC, DESC }

export const orderByAtom = atom(OrderBy.KEY);
export const orderAtom = atom(Order.ASC);
export enum NavBodyType { NONE, MARK, HELP };
export const navBodyAtom = atomWithStorage(KEY_PREFIX + 'navBody', NavBodyType.NONE, createSessionStorage());

// nav 区域
export const navPosAtom = atomWithStorage(KEY + 'pos', { top: 80, left: 30 }, createSessionStorage());
export const navListHoverAtom = atom(false);
export const navHovAtom = atom<Instance | null>(null);
export const movingAtom = atom(false);
export const creatingAtom = atom(false); // 添加

// 当前光标所载的元素
export const cursorKeyAtom = atom(0);

// 当前focus某个key下
export const focusKeyAtom = atomWithStorage<number | null>(KEY_PREFIX + 'focus', null, createSessionStorage());

// 当前是否是在 creator 状态下
export const creatorAtom = atom((get) => {
  if (get(navListHoverAtom)) return false;
  if (get(movingAtom)) return false;
  return true;
});

export const editorAtom = atom<Instance | null>(null);
// 是否正在选区选择状态
export const capturePickerAtom = atom(false);
// 是否是正在截屏中
export const captureRunningAtom = atom<boolean>(false);
// 截屏产生的数据
export const captrueDataAtom = atom<{
  dataUrl: string; x: number; y: number; w: number; h: number; dpr: number;
} | null>(null);
