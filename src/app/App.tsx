import Boxes from './boxes/Boxes.js';
import Creator from './creator/Creator.js';
import KeyMap from './keymap/KeyMap.js';
import Nav from './nav/Nav.js';

import './app.scss';
// 这里需要有个store, 让我框框

export default function App(): React.ReactNode {
  return (
    <>
      <Boxes />
      <Creator />
      <Nav />
      <KeyMap />
    </>
  );
}
