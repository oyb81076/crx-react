import { useEffect } from 'react';
import { getDefaultStore, useAtom, useSetAtom } from 'jotai';

import { focusKeyAtom, navHeaderHovAtom, navPosAtom, showListAtom } from '../atoms.js';
import { setMarks } from '../modules/setMarks.js';

import './NavHeader.scss';

export default function NavHeader(): React.ReactNode {
  const [show, setShow] = useAtom(showListAtom);
  const setFocusKey = useSetAtom(focusKeyAtom);
  const setHover = useSetAtom(navHeaderHovAtom);
  useEffect(() => () => setHover(false), [setHover]);
  const onClear = () => {
    setMarks(() => []);
    setFocusKey(null);
  };

  return (
    <header
      className="crx-nav-header"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={onMouseDown}
    >
      <button role="button" onClick={onClear}>清空</button>
      <button role="button">截屏</button>
      <button role="button" onClick={() => setShow(!show)}>
        {show ? '隐藏' : '显示'}列表
      </button>
    </header>
  );
}

const onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
  if (e.currentTarget !== e.target) return;
  const draggable = e.currentTarget.parentElement;
  if (!draggable) return;
  const offsetX = e.clientX - draggable.offsetLeft;
  const offsetY = e.clientY - draggable.offsetTop;
  let left = e.clientX - offsetX;
  let top = e.clientY - offsetY;
  draggable.style.cursor = 'grabbing';
  const handleMove = (event: MouseEvent) => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    left = event.clientX - offsetX;
    top = event.clientY - offsetY;
    const elementWidth = draggable.offsetWidth;
    const elementHeight = draggable.offsetHeight;
    left = Math.max(0, Math.min(left, viewportWidth - elementWidth)); // 限制在 [0, 视口宽度 - 元素宽度]
    top = Math.max(0, Math.min(top, viewportHeight - elementHeight)); // 限制在 [0, 视口高度 - 元素高度]
    draggable.style.left = `${left}px`;
    draggable.style.top = `${top}px`;
  };
  const handleFinish = (event: Event) => {
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleFinish);
    getDefaultStore().set(navPosAtom, { left, top });
  };
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleFinish);
};
