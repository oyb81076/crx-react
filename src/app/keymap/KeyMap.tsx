import { useEffect } from 'react';
import { getDefaultStore } from 'jotai';

import { focusKeyAtom, marksAtom } from '../atoms.js';

export default function KeyMap(): React.ReactNode {
  useEffect(() => {
    document.addEventListener('keydown', handle);
    return () => { document.removeEventListener('keydown', handle); };
  }, []);
  return null;
}

function handle(e: KeyboardEvent) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const s = getDefaultStore();
    const key = s.get(focusKeyAtom);
    if (key == null) return;
    s.set(marksAtom, (arr) => arr.filter((x) => x.key !== key));
    return;
  }
}
