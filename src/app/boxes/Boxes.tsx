import { useAtomValue } from 'jotai';

import { creatorAtom, focusKeyAtom, hovAtom, marksAtom } from '../atoms.js';
import Box from '../box/Box.js';
import Focus from './Focus.js';

export default function Boxes(): React.ReactNode {
  const creator = useAtomValue(creatorAtom);
  return creator && <Inner />;
}
function Inner(): React.ReactNode {
  const hov = useAtomValue(hovAtom);
  const marks = useAtomValue(marksAtom);
  const focusKey = useAtomValue(focusKeyAtom);
  return marks.map((x) =>
    x.key === focusKey
      ? <Focus key={x.key} mark={x} />
      : <Box key={x.key} mark={x} active={hov === x} />,
  );
}
