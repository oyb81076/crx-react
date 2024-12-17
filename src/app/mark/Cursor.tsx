import { useEffect, useRef, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import { Mark, MarkType } from '~/models/mark.js';

import { cursorKeyAtom, marksAtom, movingAtom, navListHoverAtom } from '../atoms.js';
import { createElementMark, createInnerMarks } from '../modules/createMark.js';
import { isCrxElement } from '../modules/isCrxElement.js';
import { isContainRect, isEqualRect } from '../modules/rectUtils.js';
import CreatorBox from './CreatorBox.js';

// 鼠标光标所载mark
export default function Cursor(): React.ReactNode {
  const navHover = useAtomValue(navListHoverAtom);
  const moving = useAtomValue(movingAtom);
  return !navHover && !moving && <CursorInner />;
}

function CursorInner(): React.ReactNode {
  // 光标所载mark, 新添加mark时, 会有一个0的key, 否则就是之前光标的key
  const cursor = useCursor();
  useSyncCursorKey(cursor);
  if (cursor?.key !== 0) {
    return null;
  } else {
    return <CreatorBox mark={cursor} />;
  }
}
function useSyncCursorKey(cursor: Mark | null) {
  const key = cursor?.key ?? 0;
  const setCursorKey = useSetAtom(cursorKeyAtom);
  useEffect(() => {
    setCursorKey(key);
  }, [key, setCursorKey]);
}

// 获取鼠标光标的元素
function useCursor(): Mark | null {
  // 当前光标所focus的html元素
  // 用 el 元素计算出来的未被标记的元素
  const cacheRef = useRef<{ el: HTMLElement; inners: Mark[]; marks: Mark[]; elements: Mark[] }>(null);
  // marksAtom 中的当前光标所focus的元素
  const [cursor, setCursor] = useState<Mark | null>(null);
  const marks = useAtomValue(marksAtom);
  useEffect(() => {
    setCursor(null);
    const onEnter = (e: MouseEvent) => {
      if (!isCrxElement(e.target) && e.target instanceof HTMLElement) {
        if (cacheRef.current?.el !== e.target) {
          const inners = getInners(e.target);
          const elements = getNewMark(inners, marks);
          cacheRef.current = { el: e.target, inners, marks, elements };
        } else if (cacheRef.current.marks !== marks) {
          const elements = getNewMark(cacheRef.current.inners, marks);
          cacheRef.current.marks = marks;
          cacheRef.current.elements = elements;
        }
      } else {
        cacheRef.current = null;
      }
      onMove(e);
    };
    const onMove = (e: MouseEvent) => {
      const elements = cacheRef.current?.elements ?? [];
      // 这里有优化空间, 一个是用scroll事件先截取部分marks, memo起来
      // 另一种是用算法进行二分查找
      const cursorMark = marks
        .filter((x) => isContainRect(e, x.rect))
        .sort(markSort)[0] ?? null;
      const cursorElement = elements.find((x) => isContainRect(e, x.rect)) ?? null;
      if (cursorMark && cursorElement) {
        setCursor(markSort(cursorMark, cursorElement) < 0 ? cursorMark : cursorElement);
      } else {
        setCursor(cursorMark || cursorElement);
      }
    };
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mousemove', onMove);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
    };
  }, [marks]);
  return cursor;
}

function getInners(element: HTMLElement): Mark[] {
  if (!element) return [];
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const root = createElementMark(element, rect, style);
  if (root.type !== MarkType.CONTAINER) return [root];
  const inners = createInnerMarks(element, rect, style);
  inners.push(root);
  return inners;
}
function getNewMark(inners: Mark[], marks: Mark[]): Mark[] {
  if (inners.length === 0) return [];
  return inners
    .filter((x) => marks.every((y) => !isEqualRect(x.rect, y.rect)))
    .sort(markSort);
}

function markSort(a: Mark, b: Mark): number {
  const c0 = a.rect.width * a.rect.height - b.rect.width * b.rect.height;
  if (c0 !== 0) return c0;
  return b.key - a.key;
}
