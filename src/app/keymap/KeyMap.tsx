import { useEffect } from 'react';
import { getDefaultStore } from 'jotai';

import { MarkRect } from '~/models/mark.js';

import { focusKeyAtom, historyAtom, marksAtom } from '../atoms.js';
import { fixRect, isEqualRect } from '../modules/rectUtils.js';

export default function KeyMap(): React.ReactNode {
  useInitializeHistory();
  useKeyBind();
  return null;
}

// 初始化历史记录
function useInitializeHistory() {
  useEffect(() => {
    // this is init
    const s = getDefaultStore();
    const x = s.get(historyAtom);
    if (x != null) return;
    const marks = s.get(marksAtom);
    s.set(historyAtom, { idx: 0, array: [marks] });
  }, []);
}
// 绑定快捷键
function useKeyBind() {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      actions[cmd(e)]?.(e);
    };
    document.addEventListener('keydown', handle);
    return () => { document.removeEventListener('keydown', handle); };
  }, []);
}

function cmd(e: KeyboardEvent) {
  const out: string[] = [];
  if (e.metaKey || e.ctrlKey) out.push('Cmd');
  if (e.altKey) out.push('Alt');
  if (e.shiftKey) out.push('Shift');
  out.push(e.code);
  return out.join('+');
}

const actions: Record<string, (e: KeyboardEvent) => void> = {
  'Backspace': backspace,
  'Delete': backspace,
  'Cmd+KeyZ': undo,
  'Cmd+Shift+KeyZ': redo,
  'ArrowUp': (e) => move(e, (rect) => rect.top -= 1),
  'ArrowDown': (e) => move(e, (rect) => rect.top += 1),
  'ArrowLeft': (e) => move(e, (rect) => rect.left -= 1),
  'ArrowRight': (e) => move(e, (rect) => rect.left += 1),
};

function backspace(e: KeyboardEvent) {
  const s = getDefaultStore();
  const key = s.get(focusKeyAtom);
  if (key == null) return;
  s.set(marksAtom, (arr) => arr.filter((x) => x.key !== key));
  e.preventDefault();
}
function undo(e: KeyboardEvent) {
  const s = getDefaultStore();
  const his = s.get(historyAtom);
  if (his == null || his.idx === 0 || !his.array[his.idx - 1]) return;
  e.preventDefault();
  s.set(historyAtom, { idx: his.idx - 1, array: his.array });
  s.set(marksAtom, his.array[his.idx - 1]);
}

function redo(e: KeyboardEvent) {
  const s = getDefaultStore();
  const his = s.get(historyAtom);
  if (his == null || his.idx >= his.array.length - 1) return;
  e.preventDefault();
  s.set(historyAtom, { idx: his.idx + 1, array: his.array });
  s.set(marksAtom, his.array[his.idx + 1]);
}

function move(e: KeyboardEvent, update: (rect: MarkRect) => void) {
  const s = getDefaultStore();
  const key = s.get(focusKeyAtom);
  if (key == null) return;
  const focus = s.get(marksAtom).find((x) => x.key === key);
  if (focus == null) return;
  e.preventDefault();
  const rect = { ...focus.rect };
  update(rect);
  fixRect(rect);
  if (isEqualRect(rect, focus.rect)) return;
  s.set(marksAtom, (arr) => arr.map((x) => (x.key === key ? { ...x, rect } : x)));
}
