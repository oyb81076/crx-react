import { useEffect } from 'react';
import { getDefaultStore, useSetAtom } from 'jotai';

import { cmdKeyDownAtom, configAtom, focusKeyAtom, historyAtom, marksAtom } from '../atoms.js';
import { MarkRect } from '../modules/base/base.js';
import { fixRect, isEqualRect } from '../modules/base/rectUtils.js';
import { setMark, setMarkAndDelayToHistory } from '../modules/setMarks.js';

export default function KeyMap(): React.ReactNode {
  useInitializeHistory();
  useKeyBind();
  useSyncCmd();
  return null;
}

function useSyncCmd() {
  const set = useSetAtom(cmdKeyDownAtom);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
        set(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
        set(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('keyup', handleKeyUp, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [set]);
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
      const code = cmd(e);
      const cfg = configMaps[code];
      if (cfg) {
        e.preventDefault();
        cfg.action();
      }
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

interface Config {
  title: string;
  cmd: string[];
  action: () => void;
}
const configs: Config[] = [
  { title: '删除', cmd: ['Backspace', 'Delete'], action: remove },
  { title: '撤消', cmd: ['Cmd+KeyZ'], action: undo },
  { title: '修改选区类型', cmd: ['Cmd+KeyT'], action: nextType },
  { title: '重新执行', cmd: ['Cmd+Shift+KeyZ'], action: redo },
  { title: '选区左移动', cmd: ['ArrowLeft'], action: () => move((rect) => rect.left -= 1) },
  { title: '选区右移动', cmd: ['ArrowRight'], action: () => move((rect) => rect.left += 1) },
  { title: '选区上移', cmd: ['ArrowUp'], action: () => move((rect) => rect.top -= 1) },
  { title: '选区下移', cmd: ['ArrowDown'], action: () => move((rect) => rect.top += 1) },
  { title: '选区减少宽度', cmd: ['Cmd+ArrowLeft'], action: minusWidth },
  { title: '选区减少高度', cmd: ['Cmd+ArrowUp'], action: minusHeight },
  { title: '选区增加宽度', cmd: ['Cmd+ArrowRight'], action: plusWidth },
  { title: '选区增加高度', cmd: ['Cmd+ArrowDown'], action: plusHeight },
  { title: '选区左侧对齐', cmd: ['Cmd+Shift+ArrowLeft'], action: resizeToLeft },
  { title: '选区顶部对齐', cmd: ['Cmd+Shift+ArrowUp'], action: resizeToTop },
  { title: '选区右侧对齐', cmd: ['Cmd+Shift+ArrowRight'], action: resizeToRight },
  { title: '选区底部对齐', cmd: ['Cmd+Shift+ArrowDown'], action: resizeToBottom },
];
const configMaps = Object.fromEntries(configs.flatMap((x) => x.cmd.map((y) => [y, x])));

function remove() {
  const focus = getFocus();
  if (!focus) return;
  const s = getDefaultStore();
  s.set(marksAtom, (arr) => arr.filter((x) => x !== focus));
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
  if (focus.rect.width <= 1) return;
  const rect: MarkRect = { ...focus.rect, width: Math.max(focus.rect.width - 1, 1) };
  setMarkAndDelayToHistory({ ...focus, rect });
}

function minusHeight() {
  const focus = getFocus();
  if (focus == null) return;
  if (focus.rect.height > 1) return;
  const rect: MarkRect = { ...focus.rect, height: Math.max(focus.rect.height - 1, 1) };
  setMarkAndDelayToHistory({ ...focus, rect });
}
function plusWidth() {
  const focus = getFocus();
  if (focus == null) return;
  const { scrollWidth } = document.documentElement;
  if (focus.rect.left + focus.rect.width >= scrollWidth) return;
  const offsetX = Math.min(scrollWidth - focus.rect.left - focus.rect.width, 1);
  const rect: MarkRect = { ...focus.rect, width: focus.rect.width + offsetX };
  setMarkAndDelayToHistory({ ...focus, rect });
}
function resizeToLeft() {
  const focus = getFocus();
  if (focus == null) return;
  if (focus.rect.left === 0) return;
  const rect: MarkRect = {
    ...focus.rect,
    width: focus.rect.width + focus.rect.left,
    left: 0,
  };
  setMark({ ...focus, rect });
}
function resizeToTop() {
  const focus = getFocus();
  if (focus == null) return;
  if (focus.rect.top === 0) return;
  const rect: MarkRect = {
    ...focus.rect,
    height: focus.rect.height + focus.rect.top,
    top: 0,
  };
  setMark({ ...focus, rect });
}
function resizeToRight() {
  const focus = getFocus();
  if (focus == null) return;
  const { scrollWidth } = document.documentElement;
  if (focus.rect.left + focus.rect.width === scrollWidth) return;
  const rect: MarkRect = {
    ...focus.rect,
    width: scrollWidth - focus.rect.left,
  };
  setMark({ ...focus, rect });
}
function resizeToBottom() {
  const focus = getFocus();
  if (focus == null) return;
  const { scrollHeight } = document.documentElement;
  if (focus.rect.top + focus.rect.height === scrollHeight) return;
  const rect: MarkRect = {
    ...focus.rect,
    height: scrollHeight - focus.rect.top,
  };
  setMark({ ...focus, rect });
}

function plusHeight() {
  const focus = getFocus();
  if (focus == null) return;
  const { scrollHeight } = document.documentElement;
  if (focus.rect.top + focus.rect.height >= scrollHeight) return;
  const offsetY = Math.min(scrollHeight - focus.rect.top - focus.rect.height, 1);
  const rect = { ...focus.rect, height: focus.rect.height + offsetY };
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
