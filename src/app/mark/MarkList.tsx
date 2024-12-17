import { useAtomValue } from 'jotai';

import { cursorKeyAtom, focusKeyAtom, marksAtom, navListHoverAtom } from '../atoms.js';
import ActiveBox from './ActiveBox.js';
import Box from './Box.js';

export default function MarkList(): React.ReactNode {
  const creator = useAtomValue(navListHoverAtom);
  return !creator && <Inner />;
}
function Inner(): React.ReactNode {
  const cursorKey = useAtomValue(cursorKeyAtom);
  const marks = useAtomValue(marksAtom);
  const focusKey = useAtomValue(focusKeyAtom);
  return marks.map((x) => {
    if (x.key === cursorKey || x.key === focusKey) return <ActiveBox key={x.key} mark={x} />;
    return <Box key={x.key} mark={x} />;
  });
}
