import { useEffect } from 'react';
import { getDefaultStore } from 'jotai';

import { historyAtom, marksAtom } from '../atoms.js';

export default function Histories(): React.ReactNode {
  useEffect(() => {
    // this is init
    const s = getDefaultStore();
    const { array } = s.get(historyAtom);
    if (array.length !== 0) return;
    const marks = s.get(marksAtom);
    s.set(historyAtom, { idx: 0, array: [marks] });
  }, []);
  return null;
}
