import { getDefaultStore } from 'jotai';

import { Instance } from '~/app/modules/instance/instanceModels.js';
import { setTimeout } from '~/utils/timer.js';

import { historyAtom, marksAtom } from '../atoms.js';

export function setMarks(set: (arr: Instance[]) => Instance[]) {
  const s = getDefaultStore();
  const arr = s.get(marksAtom);
  const next = set(arr);
  if (next === arr) return;
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

let timer = 0;
export function setMarkAndDelayToHistory(obj: Instance) {
  const s = getDefaultStore();
  const arr = s.get(marksAtom);
  const next = update(arr, obj);
  if (next === arr) return;
  s.set(marksAtom, next);
  const his = s.get(historyAtom);
  if (timer) window.clearTimeout(timer);
  timer = setTimeout(() => {
    timer = 0;
    const nextHis = s.get(historyAtom);
    if (nextHis !== his) return;
    if (!his) {
      s.set(historyAtom, { idx: 0, array: [next] });
    } else {
      const array = his.array.slice(0, his.idx + 1);
      array.push(next);
      s.set(historyAtom, { idx: array.length - 1, array });
    }
  }, 1000);
}

function update(arr: Instance[], obj: Instance): Instance[] {
  const key = obj.key;
  const idx = arr.findIndex((x) => x.key === key);
  if (idx === -1) {
    return arr;
  }
  const next = arr.slice();
  next[idx] = obj;
  return next;
}

export function setMark(obj: Instance) {
  setMarks((arr) => update(arr, obj));
}
