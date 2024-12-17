import { useEffect } from 'react';
import { getDefaultStore } from 'jotai';

import { focusKeyAtom, historyAtom, marksAtom } from '../atoms.js';

export default function KeyMap(): React.ReactNode {
  useEffect(() => {
    document.addEventListener('keydown', handle);
    return () => { document.removeEventListener('keydown', handle); };
  }, []);
  return null;
}

function handle(e: KeyboardEvent) {
  if (e.code === 'Delete' || e.code === 'Backspace') {
    const s = getDefaultStore();
    const key = s.get(focusKeyAtom);
    if (key == null) return;
    s.set(marksAtom, (arr) => arr.filter((x) => x.key !== key));
    return;
  } else if (e.code === 'KeyZ' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    const s = getDefaultStore();
    const { idx, array } = s.get(historyAtom);
    console.log(idx, array);
    if (idx !== 0 && array[idx - 1]) {
      s.set(historyAtom, { idx: idx - 1, array });
      s.set(marksAtom, array[idx - 1]);
    }
  } else if (e.code === 'KeyZ' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    const s = getDefaultStore();
    const { idx, array } = s.get(historyAtom);
    if (idx < array.length - 1) {
      s.set(historyAtom, { idx: idx + 1, array });
      s.set(marksAtom, array[idx + 1]);
    }
  }
}
