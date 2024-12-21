import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';

import { capturePickerAtom, captureRunningAtom } from './atoms.js';
import Capture from './capture/Capture.js';
import MarkEditor from './editor/MarkEditor.js';
import KeyMap from './keymap/KeyMap.js';
import Creating from './mark/Creating.js';
import Cursor from './mark/Cursor.js';
import MarkList from './mark/MarkList.js';
import Nav from './nav/Nav.js';

import './app.scss';
// 这里需要有个store, 让我框框

export default function App(): React.ReactNode {
  const state = useKeydownAlt();
  const running = useAtomValue(captureRunningAtom);
  const capture = useAtomValue(capturePickerAtom);
  return (
    <>
      <div style={{ display: state && !running ? 'block' : 'none' }}>
        <MarkList />
        {!capture && <Cursor />}
        {!capture && <Creating />}
        {!capture && <Nav />}
        {capture && <Capture />}
      </div>
      <KeyMap />
      <MarkEditor />
    </>
  );
}

// 写一个hooks，用来监听键盘持续按着Alt键的状态
function useKeydownAlt() {
  const [state, setState] = useState(true);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'AltLeft') {
        setState(false);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'AltLeft') {
        setState(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return state;
}
