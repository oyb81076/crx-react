import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { Instance } from '~/app/modules/instance/instanceModels.js';

import { configAtom, editorAtom, focusKeyAtom, marksAtom, navBodyAtom, NavBodyType, navHovAtom, navListHoverAtom, Order, orderAtom, OrderBy, orderByAtom } from '../atoms.js';
import scrollToRect from '../modules/base/scrollToRect.js';
import { setMarks } from '../modules/setMarks.js';

export default function NavMarks(): React.ReactNode {
  const value = useAtomValue(navBodyAtom);
  return value === NavBodyType.MARK && <Inner />;
}
function Inner() {
  const marks = useAtomValue(marksAtom);
  const orderBy = useAtomValue(orderByAtom);
  const order = useAtomValue(orderAtom);
  const array = useMemo(() => sort(marks, orderBy, order), [marks, order, orderBy]);
  const setHover = useSetAtom(navListHoverAtom);
  const [focusKey, setFocusKey] = useAtom(focusKeyAtom);
  useEffect(() => () => setHover(false), [setHover]);
  return (
    <div
      className="crx-nav-marks"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <ul>
        {array.map((x) => <Item key={x.key} mark={x} active={x.key === focusKey} />)}
      </ul>
      <footer>
        <button
          type="button"
          onClick={() => {
            setMarks(() => []);
            setFocusKey(null);
          }}
        >
          清空
        </button>
      </footer>
    </div>
  );
}
function Item({ mark, active }: { mark: Instance; active: boolean }) {
  const rect = mark.rect;
  const config = useAtomValue(configAtom);
  const setFocusKey = useSetAtom(focusKeyAtom);
  const setHov = useSetAtom(navHovAtom);
  const setEditor = useSetAtom(editorAtom);
  const ref = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    if (!active) return;
    ref.current?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  return (
    <li
      ref={ref}
      role="presentation"
      className={clsx('crx-nav-mark', { 'crx-active': active })}
      onMouseEnter={() => setHov(mark)}
      onMouseLeave={() => setHov(null)}
      onClick={() => {
        setFocusKey((x) => x === mark.key ? null : mark.key);
        scrollToRect(mark.rect);
      }}
    >
      <div className="crx-pointer" style={{ backgroundColor: config.colors[mark.type].backgroundColor }} />
      <div className="crx-type">{config.titles[mark.type]}{mark.key}</div>
      <div className="crx-rect">{rect.w}x{rect.h}</div>
      <button
        role="button"
        className="crx-btn"
        onClick={(e) => {
          e.stopPropagation();
          setEditor(mark);
        }}
      >
        编辑
      </button>
      <button
        role="button"
        className="crx-btn"
        onClick={(e) => {
          e.stopPropagation();
          setMarks((arr) => arr.filter((x) => x !== mark));
          setHov((x) => x && x.key === mark.key ? null : x);
        }}
      >
        删除
      </button>
    </li>
  );
}

function sort(marks: Instance[], orderBy: OrderBy, order: Order) {
  if (orderBy === OrderBy.KEY) {
    if (order === Order.ASC) return marks;
    return marks.slice().reverse();
  }
  if (orderBy === OrderBy.POSITION) { // 根据position排序
    if (order === Order.ASC) {
      return marks.slice().sort(compareAsc);
    } else {
      return marks.slice().sort(compareDesc);
    }
  }
  return marks;
}

/**
 * 比较顺序:
 * 谁靠上谁排前面
 * 谁靠左谁排前面
 * 谁面积大谁排前面
 */
function compareAsc(a: Instance, b: Instance): number {
  const ar = a.rect;
  const br = b.rect;
  const top = ar.y - br.y;
  if (top !== 0) return top;
  const left = ar.x - br.x;
  if (left !== 0) return left;
  const area = br.w * br.h - ar.w * ar.h;
  if (area !== 0) return area;
  return a.key - b.key;
}
function compareDesc(a: Instance, b: Instance) {
  return -compareAsc(a, b);
}
