import KeyMap from './keymap/KeyMap.js';
import Cursor from './mark/Cursor.js';
import MarkList from './mark/MarkList.js';
import Nav from './nav/Nav.js';

import './app.scss';
// 这里需要有个store, 让我框框

export default function App(): React.ReactNode {
  return (
    <>
      <MarkList />
      <Cursor />
      <Nav />
      <KeyMap />
    </>
  );
}
