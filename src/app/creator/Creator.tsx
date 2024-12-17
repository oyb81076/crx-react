import { useEffect, useMemo, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import { Mark, MarkRect, MarkType } from '~/models/mark.js';

import { creatorAtom, focusKeyAtom, hovAtom, marksAtom } from '../atoms.js';
import CreatorBox from '../box/CreatorBox.js';
import { createElementMark, createInnerMarks } from '../modules/createMark.js';
import isContainRect from '../modules/isContainRect.js';
import { isCrxElement } from '../modules/isCrxElement.js';
import { setMarks } from '../modules/setMarks.js';

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
    const rect = element.getBoundingClientRect();
    const root = createElementMark(element, rect, style);
    const texts = root.type === MarkType.CONTAINER ? createInnerMarks(element, rect, style) : [];
    return { root, texts };
  }, [element]);
  const { root, texts } = out;
  const [mark, setMark] = useState<Mark>(root);
  const marks = useAtomValue(marksAtom);
  const setFocusKey = useSetAtom(focusKeyAtom);
  useEffect(() => { setMark(root); }, [root]);
  useEffect(() => {
    if (texts.length === 0) return;
    const handleMove = (e: MouseEvent) => {
      const t = texts.find((x) => isContainRect(e, x.rect));
      const mark = t || root;
      setMark(mark);
    };
    document.addEventListener('mousemove', handleMove);
    return () => {
      document.removeEventListener('mousemove', handleMove);
    };
  }, [root, texts]);
  const hov = marks.find((x) => isEquals(x.rect, mark.rect));
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isCrxElement(e.target)) return;
      if (!isContainRect(e, mark.rect)) return;
      e.preventDefault();
      e.stopPropagation();
      if (hov) {
        setFocusKey(hov.key);
      } else {
        const key = marks.reduce((p, x) => Math.max(p, x.key), 0) + 1;
        setMarks((x) => [...x, { ...mark, key }]);
        setFocusKey(key);
      }
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [mark, hov, setFocusKey, marks]);
  if (hov) return <Hov mark={hov} />;
  return <CreatorBox mark={mark} />;
}
function Hov({ mark }: { mark: Mark }) {
  const set = useSetAtom(hovAtom);
  useEffect(() => {
    set(mark);
    return () => {
      set(null);
    };
  }, [mark, set]);
  return null;
}

function isEquals(a: MarkRect, b: MarkRect) {
  return a.top === b.top && a.left === b.left && a.height === b.height && a.width === b.width;
}
