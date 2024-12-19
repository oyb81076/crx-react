import { useAtomValue } from 'jotai';

import { cursorKeyAtom, focusKeyAtom, marksAtom, navListHoverAtom } from '../atoms.js';
import ActiveBox from './BoxActive.js';
import Box from './BoxNormal.js';

export default function MarkList(): React.ReactNode {
  const creator = useAtomValue(navListHoverAtom);
  return !creator && <Inner />;
}
function Inner(): React.ReactNode {
  const cursorKey = useAtomValue(cursorKeyAtom);
  const marks = useAtomValue(marksAtom);
  const focusKey = useAtomValue(focusKeyAtom);
  return marks.map((x) => {
    if (x.key === focusKey) return <ActiveBox key={x.key} mark={x} state="active" />;
    if (x.key === cursorKey) return <ActiveBox key={x.key} mark={x} state="hover" />;
    return <Box key={x.key} mark={x} />;
  });
}
