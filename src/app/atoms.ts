import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { Mark } from '~/models/mark.js';

import { createSessionStorage } from './modules/sessionStorage.js';

// 为了避免数据, 其实还需要登陆功能

// 怎么处理storage????? window.location.hash

const KEY_PREFIX = window.location.pathname + window.location.search + '::';

// mark 是需要绑定游览器宽度的, 不同宽度下 mark出来的东西不一样
export const markWidth = atom(() => document.documentElement.clientWidth);

export const marksAtom = atomWithStorage<Mark[]>(
  KEY_PREFIX + 'marks',
  [],
  createSessionStorage(),
);

// base64 图片地址 注意这个数据不存储, 要用的时候截屏就可以了
export const dataUrlAtom = atom<string | null>();

export enum OrderBy { KEY, POSITION }
export enum Order { ASC, DESC }

export const orderByAtom = atom(OrderBy.KEY);
export const orderAtom = atom(Order.ASC);

export const showListAtom = atomWithStorage(KEY_PREFIX + 'showList', false, createSessionStorage());

// nav 区域
export const navHeaderHovAtom = atom(false);
export const navPosAtom = atom({ top: 80, left: 30 });
export const navListHoverAtom = atom(false);
export const navHovAtom = atom<Mark | null>(null);

// 当前正在被hover的 mark
export const hovAtom = atom<Mark | null>(null);
// 当前focus某个key下
export const focusKeyAtom = atomWithStorage<number | null>(KEY_PREFIX + 'focus', null, createSessionStorage());

// 当前是否是在 creator 状态下
export const creatorAtom = atom((get) => {
  if (get(navListHoverAtom)) return false;
  return true;
});
