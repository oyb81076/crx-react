import { getDefaultStore } from 'jotai';

import { Mark } from '~/models/mark.js';

import { historyAtom, marksAtom } from '../atoms.js';

export function setMarks(set: (arr: Mark[]) => Mark[]) {
  const s = getDefaultStore();
  const arr = s.get(marksAtom);
  const next = set(arr);
  s.set(marksAtom, next);
  const his = s.get(historyAtom);
  if (!his) {
    s.set(historyAtom, { idx: 0, array: [next] });
  } else {
    const array = his.array.slice(0, his.idx + 1);
    array.push(next);
    s.set(historyAtom, { idx: array.length - 1, array });
  }
}
