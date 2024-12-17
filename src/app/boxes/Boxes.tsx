import { useAtomValue } from 'jotai';

import { focusKeyAtom, hovAtom, marksAtom, navListHoverAtom } from '../atoms.js';
import ActiveBox from '../box/ActiveBox.js';
import Box from '../box/Box.js';

export default function Boxes(): React.ReactNode {
  const creator = useAtomValue(navListHoverAtom);
  return !creator && <Inner />;
}
function Inner(): React.ReactNode {
  const hov = useAtomValue(hovAtom);
  const marks = useAtomValue(marksAtom);
  const focusKey = useAtomValue(focusKeyAtom);
  return marks.map((x) =>
    x.key === focusKey || hov === x
      ? <ActiveBox key={x.key} mark={x} />
      : <Box key={x.key} mark={x} />,
  );
}
