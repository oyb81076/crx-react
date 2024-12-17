import { memo, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { getDefaultStore } from 'jotai';

import { Mark } from '~/models/mark.js';

import { movingAtom } from '../atoms.js';
import isContainRect from '../modules/isContainRect.js';
import markName from '../modules/markName.js';
import { setMarks } from '../modules/setMarks.js';
import { isMarkOutside, isMarkRight } from './boxUtils.js';

import './Box.scss';

// 外边框vs内边框, 我们选择外边框
interface Props {
  mark: Mark;
}

function ActiveBox({ mark }: Props): React.ReactNode {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const draggable = ref.current;
    if (!draggable) return;
    const handle = (e: MouseEvent) => {
      onMouseDown(e, draggable, mark);
    };
    document.addEventListener('mousedown', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
    };
  }, [mark]);
  return (
    <>
      <div ref={ref} className="crx-simple-box crx-active" style={mark.rect}>
        <div className={clsx('crx-simple-tag',
          isMarkRight(mark.rect) && 'crx-right',
          isMarkOutside(mark) && 'crx-outside',
        )}
        >
          {markName(mark)}{mark.key === 0 ? '新增' : mark.key}
        </div>
      </div>
    </>
  );
}

const onMouseDown = (e: MouseEvent, draggable: HTMLDivElement, mark: Mark) => {
  const rect = mark.rect;
  if (!isContainRect(e, rect)) return;
  e.preventDefault();
  e.stopPropagation();
  const s = getDefaultStore();
  const clientX = e.clientX;
  const clientY = e.clientY;
  let left = rect.left;
  let top = rect.top;
  const { scrollWidth, scrollHeight } = document.documentElement;
  const maxLeft = scrollWidth - rect.width;
  const maxTop = scrollHeight - rect.height;
  let moving = false;
  const handleMove = (event: MouseEvent) => {
    moving = true;
    s.set(movingAtom, true);
    left = event.clientX - clientX + rect.left;
    top = event.clientY - clientY + rect.top;
    left = Math.max(0, Math.min(left, maxLeft)); // 限制在 [0, 视口宽度 - 元素宽度]
    top = Math.max(0, Math.min(top, maxTop)); // 限制在 [0, 视口高度 - 元素高度]
    left = Math.round(left);
    top = Math.round(top);
    draggable.style.left = `${left}px`;
    draggable.style.top = `${top}px`;
    draggable.style.pointerEvents = 'all';
    draggable.style.cursor = 'move';
  };
  const handleFinish = (event: Event) => {
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleFinish);
    draggable.style.pointerEvents = '';
    draggable.style.cursor = '';
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => e.preventDefault(), { once: true });
    setMarks((arr) => arr.map((x) => {
      if (x.key !== mark.key) return x;
      return { ...mark, rect: { ...mark.rect, left, top } };
    }));
  };
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleFinish);
};

export default memo(ActiveBox);
