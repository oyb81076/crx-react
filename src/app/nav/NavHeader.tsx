import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';

import { focusKeyAtom, marksAtom, navHeaderHovAtom, showListAtom } from '../atoms.js';

import './NavHeader.scss';

export default function NavHeader(): React.ReactNode {
  const [show, setShow] = useAtom(showListAtom);
  const setMarks = useSetAtom(marksAtom);
  const setFocusKey = useSetAtom(focusKeyAtom);
  const setHover = useSetAtom(navHeaderHovAtom);
  useEffect(() => () => setHover(false), [setHover]);
  const onClear = () => {
    setMarks([]);
    setFocusKey(null);
  };
  return (
    <header
      className="crx-nav-header"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button role="button" onClick={onClear}>清空</button>
      <button role="button">截屏</button>
      <button role="button" onClick={() => setShow(!show)}>
        {show ? '隐藏' : '显示'}列表
      </button>
    </header>
  );
}
