import { useAtomValue } from 'jotai';

import { navPosAtom } from '../atoms.js';
import NavHeader from './NavHeader.js';
import NavList from './NavList.js';

import './Nav.scss';

export default function Nav(): React.ReactNode {
  const { left, top } = useAtomValue(navPosAtom);
  return (
    <nav className="crx-nav" style={{ left, top }}>
      <NavHeader />
      <NavList />
    </nav>
  );
}
