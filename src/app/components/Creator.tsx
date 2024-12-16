import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';

import { Mark, MarkControl, MarkLayout, MarkPosition, MarkRect, MarkType } from '~/models/mark.js';

import { creatorAtom, focusKeyAtom, marksAtom } from '../atoms.js';
import { createElementMark, createTextMarks } from '../modules/createMark.js';
import { isCrxElement } from '../modules/isCrxElement.js';

import './Creator.scss';

export default function Creator(): React.ReactNode {
  const creator = useAtomValue(creatorAtom);
  return creator && <Inner />;
}
function Inner(): React.ReactNode {
  const [element, setElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const onMouseEnter = (e: MouseEvent) => {
      if (isCrxElement(e.target)) return;
      if (!(e.target instanceof HTMLElement)) return;
      setElement(e.target);
    };
    document.addEventListener('mouseover', onMouseEnter);
    return () => {
      document.removeEventListener('mouseover', onMouseEnter);
    };
  }, []);
  // touching 用鼠标拖动来生成一个框框
  if (!element) return null;
  return <MarkElement element={element} />;
}
function MarkElement({ element }: { element: HTMLElement }) {
  // root, 当前节点, texts 文本节点
  const out = useMemo(() => {
    const style = window.getComputedStyle(element);
    const root = createElementMark(element, style);
    const texts = root.type === MarkType.LAYOUT ? createTextMarks(element) : [];
    return { root, texts };
  }, [element]);
  const { root, texts } = out;
  const [mark, setMark] = useState<Mark>(root);
  const setMarks = useSetAtom(marksAtom);
  const setFocusKey = useSetAtom(focusKeyAtom);
  useEffect(() => { setMark(root); }, [root]);
  useEffect(() => {
    if (texts.length === 0) return;
    const handleMove = (e: MouseEvent) => {
      const t = texts.find((x) => isContain(e, x.rect));
      const mark = t || root;
      setMark(mark);
    };
    document.addEventListener('mousemove', handleMove);
    return () => {
      document.removeEventListener('mousemove', handleMove);
    };
  }, [root, texts]);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isCrxElement(e.target)) return;
      if (!isContain(e, mark.rect)) return;
      e.preventDefault();
      e.stopPropagation();
      setMarks((x) => [...x, mark]);
      setFocusKey(mark.key);
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [mark, setFocusKey, setMarks]);
  return <Border mark={mark} />;
}
function isContain({ clientX, clientY }: MouseEvent, { left, width, top, height }: MarkRect) {
  const offsetX = clientX + window.scrollX - left;
  if (offsetX < 0 || offsetX > width) return false;
  const offsetY = clientY + window.scrollY - top;
  if (offsetY < 0 || offsetY > height) return false;
  return true;
}

function useScrollY() {
  const [scrollY, setScrollY] = useState(window.scrollY);
  useEffect(() => {
    const handle = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handle);
    return () => {
      window.removeEventListener('scroll', handle);
    };
  }, []);
  return scrollY;
}

function Border({ mark }: { mark: Mark }) {
  const rect = mark.rect;
  const border = 2;
  let top = rect.top - border;
  let left = rect.left - border;
  let width = rect.width + border * 2;
  let height = rect.height + border * 2;
  if (top < 0) {
    height += top;
    top = 0;
  }
  if (left < 0) {
    width += left;
    left = 0;
  }
  const right = document.documentElement.clientWidth - left - width;
  if (right < 0) {
    width += right;
  }
  const bottom = document.documentElement.scrollHeight - top - height;
  if (bottom < 0) {
    height += bottom;
  }
  const scrollY = useScrollY();
  // crx-box-tag-in-left-top
  return (
    <div className="crx-focus-mark" style={{ top, left, width, height }}>
      <div className={clsx('crx-mark-tag', {
        'crx-in': (top - scrollY) <= 20,
        'crx-right': left >= document.documentElement.clientWidth - 200,
      })}
      >
        {tagName(mark)}
      </div>
    </div>
  );
}

function tagName(mark: Mark) {
  let out: string = mark.type;
  if (mark.type === MarkType.LAYOUT) {
    if (mark.control !== MarkControl.NONE) {
      out += ':' + mark.control;
    }
    if (mark.layout !== MarkLayout.PARAGRAPH) {
      out += ':' + mark.layout;
    }
    if (mark.position !== MarkPosition.STATIC) {
      out += mark.position;
    }
  }
  return out;
}
