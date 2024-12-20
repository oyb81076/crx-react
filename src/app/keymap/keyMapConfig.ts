import { getDefaultStore } from 'jotai';

import { configAtom, focusKeyAtom, historyAtom, marksAtom } from '../atoms.js';
import { MarkRect } from '../modules/base/base.js';
import { fixRect, isEqualRect } from '../modules/base/rectUtils.js';
import { setMark, setMarkAndDelayToHistory, setMarks } from '../modules/setMarks.js';

interface Config {
  title: string;
  cmd: string[];
  input?: boolean; // 允许在input中生效
  action: () => void;
}
export const keyMapConfigs: Config[] = [
  { title: '删除', cmd: ['Backspace', 'Delete'], action: remove },
  { title: '撤消', cmd: ['Cmd+KeyZ'], action: undo },
  { title: '修改选区类型', cmd: ['Cmd+KeyT'], action: nextType },
  { title: '重新执行', cmd: ['Cmd+Shift+KeyZ'], action: redo },
  { title: '选区左移动', cmd: ['ArrowLeft'], action: () => move((rect) => rect.x -= 1) },
  { title: '选区右移动', cmd: ['ArrowRight'], action: () => move((rect) => rect.x += 1) },
  { title: '选区上移', cmd: ['ArrowUp'], action: () => move((rect) => rect.y -= 1) },
  { title: '选区下移', cmd: ['ArrowDown'], action: () => move((rect) => rect.y += 1) },
  { title: '选区减少宽度', cmd: ['Cmd+ArrowLeft'], action: minusWidth },
  { title: '选区减少高度', cmd: ['Cmd+ArrowUp'], action: minusHeight },
  { title: '选区增加宽度', cmd: ['Cmd+ArrowRight'], action: plusWidth },
  { title: '选区增加高度', cmd: ['Cmd+ArrowDown'], action: plusHeight },
  { title: '选区左侧对齐', cmd: ['Cmd+Shift+ArrowLeft'], action: resizeToLeft },
  { title: '选区顶部对齐', cmd: ['Cmd+Shift+ArrowUp'], action: resizeToTop },
  { title: '选区右侧对齐', cmd: ['Cmd+Shift+ArrowRight'], action: resizeToRight },
  { title: '选区底部对齐', cmd: ['Cmd+Shift+ArrowDown'], action: resizeToBottom },
];

function remove() {
  const focus = getFocus();
  if (!focus) return;
  setMarks((arr) => arr.filter((x) => x !== focus));
}
function undo() {
  const s = getDefaultStore();
  const his = s.get(historyAtom);
  if (his == null || his.idx === 0 || !his.array[his.idx - 1]) return;
  s.set(historyAtom, { idx: his.idx - 1, array: his.array });
  s.set(marksAtom, his.array[his.idx - 1]);
}

function redo() {
  const s = getDefaultStore();
  const his = s.get(historyAtom);
  if (his == null || his.idx >= his.array.length - 1) return;
  s.set(historyAtom, { idx: his.idx + 1, array: his.array });
  s.set(marksAtom, his.array[his.idx + 1]);
}

function move(update: (rect: MarkRect) => void) {
  const focus = getFocus();
  if (focus == null) return;
  const rect = { ...focus.rect };
  update(rect);
  fixRect(rect);
  if (isEqualRect(rect, focus.rect)) return;
  setMarkAndDelayToHistory({ ...focus, rect });
}

function minusWidth() {
  const focus = getFocus();
  if (focus == null) return;
  if (focus.rect.w <= 1) return;
  const rect: MarkRect = { ...focus.rect, w: Math.max(focus.rect.w - 1, 1) };
  setMarkAndDelayToHistory({ ...focus, rect });
}

function minusHeight() {
  const focus = getFocus();
  if (focus == null) return;
  if (focus.rect.h > 1) return;
  const rect: MarkRect = { ...focus.rect, h: Math.max(focus.rect.h - 1, 1) };
  setMarkAndDelayToHistory({ ...focus, rect });
}
function plusWidth() {
  const focus = getFocus();
  if (focus == null) return;
  const { scrollWidth } = document.documentElement;
  if (focus.rect.x + focus.rect.w >= scrollWidth) return;
  const offsetX = Math.min(scrollWidth - focus.rect.x - focus.rect.w, 1);
  const rect: MarkRect = { ...focus.rect, w: focus.rect.w + offsetX };
  setMarkAndDelayToHistory({ ...focus, rect });
}
function resizeToLeft() {
  const focus = getFocus();
  if (focus == null) return;
  if (focus.rect.x === 0) return;
  const rect: MarkRect = {
    ...focus.rect,
    w: focus.rect.w + focus.rect.x,
    x: 0,
  };
  setMark({ ...focus, rect });
}
function resizeToTop() {
  const focus = getFocus();
  if (focus == null) return;
  if (focus.rect.y === 0) return;
  const rect: MarkRect = { ...focus.rect, h: focus.rect.h + focus.rect.y, y: 0 };
  setMark({ ...focus, rect });
}
function resizeToRight() {
  const focus = getFocus();
  if (focus == null) return;
  const { scrollWidth } = document.documentElement;
  if (focus.rect.x + focus.rect.w === scrollWidth) return;
  const rect: MarkRect = { ...focus.rect, w: scrollWidth - focus.rect.x };
  setMark({ ...focus, rect });
}
function resizeToBottom() {
  const focus = getFocus();
  if (focus == null) return;
  const { scrollHeight } = document.documentElement;
  if (focus.rect.y + focus.rect.h === scrollHeight) return;
  const rect: MarkRect = { ...focus.rect, h: scrollHeight - focus.rect.y };
  setMark({ ...focus, rect });
}

function plusHeight() {
  const focus = getFocus();
  if (focus == null) return;
  const { scrollHeight } = document.documentElement;
  if (focus.rect.y + focus.rect.h >= scrollHeight) return;
  const offsetY = Math.min(scrollHeight - focus.rect.y - focus.rect.h, 1);
  const rect = { ...focus.rect, height: focus.rect.h + offsetY };
  getDefaultStore().set(marksAtom, (arr) => arr.map((x) => (x === focus ? { ...x, rect } : x)));
}

function nextType() {
  const focus = getFocus();
  if (focus == null) return;
  const s = getDefaultStore();
  const config = s.get(configAtom);
  const next = config.nextType(focus);
  setMark(next);
}

function getFocus() {
  const s = getDefaultStore();
  const key = s.get(focusKeyAtom);
  if (key) {
    const focus = s.get(marksAtom).find((x) => x.key === key);
    return focus;
  }
  return null;
}
