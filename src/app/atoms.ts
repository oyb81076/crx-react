import { atom, getDefaultStore } from 'jotai';

import { Mark } from '~/models/mark.js';

// 为了避免数据, 其实还需要登陆功能

// 怎么处理storage????? window.location.hash

// mark 是需要绑定游览器宽度的, 不同宽度下 mark出来的东西不一样
export const markWidth = atom(() => document.documentElement.clientWidth);

export const marksAtom = atom<Mark[]>([]);

// base64 图片地址 注意这个数据不存储, 要用的时候截屏就可以了
export const dataUrlAtom = atom<string | null>();

// mark.key
export const keyAtom = atom(1);

// 生成mark.key
export function createKey() {
  const store = getDefaultStore();
  const s = store.get(keyAtom);
  store.set(keyAtom, s + 1);
  return s;
}
