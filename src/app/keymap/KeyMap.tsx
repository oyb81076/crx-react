import { useEffect } from 'react';
import { getDefaultStore } from 'jotai';

import { capturePickerAtom, historyAtom, marksAtom } from '../atoms.js';
import { keyMapConfigs } from './keyMapConfig.js';

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
      const capture = getDefaultStore().get(capturePickerAtom);
      if (capture) return;
      const code = cmd(e);
      const cfg = configMaps[code];
      if (!cfg) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (!cfg.input) return;
      }
      e.preventDefault();
      cfg.action();
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

const configMaps = Object.fromEntries(keyMapConfigs.flatMap((x) => x.cmd.map((y) => [y, x])));
