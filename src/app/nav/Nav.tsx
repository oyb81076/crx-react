import { useAtomValue } from 'jotai';

import { movingAtom, navHovAtom, navPosAtom } from '../atoms.js';
import BoxNormal from '../mark/BoxNormal.js';
import NavHeader from './NavHeader.js';
import NavHelp from './NavHelp.js';
import NavMarks from './NavMarks.js';

import './Nav.scss';

export default function Nav(): React.ReactNode {
  const { left, top } = useAtomValue(navPosAtom);
  const moving = useAtomValue(movingAtom);
  return (
    <>
      <nav className="crx-nav" style={{ left, top, pointerEvents: moving ? 'none' : undefined }}>
        <NavHeader />
        <NavMarks />
        <NavHelp />
      </nav>
      <NavHov />
    </>
  );
}

function NavHov(): React.ReactNode {
  const hov = useAtomValue(navHovAtom);
  return hov && <BoxNormal mark={hov} active />;
}
