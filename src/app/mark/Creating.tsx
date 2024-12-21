import { useEffect, useState } from 'react';
import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';

import { configAtom, creatingAtom, focusKeyAtom, marksAtom } from '../atoms.js';
import { MarkRect } from '../modules/base/base.js';
import { InstanceType } from '../modules/instance/instanceModels.js';
import { setMarks } from '../modules/setMarks.js';

export default function Creating(): React.ReactNode {
  const creating = useAtomValue(creatingAtom);
  return creating && <Inner />;
}

interface Rect {
  left: number; top: number; width: number; height: number;
}
function Inner(): React.ReactNode {
  const setCreating = useSetAtom(creatingAtom);
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setCreating(false);
      }
    };
    document.addEventListener('keydown', onKeydown, { capture: true });
    return () => {
      document.removeEventListener('keydown', onKeydown, { capture: true });
    };
  }, [setCreating]);
  const [rect, setRect] = useState<Rect | null>(null);
  useEffect(() => {
    const handle = (e: MouseEvent) => onMouseDown(e, setRect);
    document.addEventListener('mousedown', handle, { capture: true });
    return () => {
      document.removeEventListener('mousedown', handle, { capture: true });
    };
  }, []);
  const config = useAtomValue(configAtom);
  return rect && (
    <div
      className="crx-mark"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        opacity: 0.7,
        backgroundColor: config.colors[InstanceType.IMAGE].backgroundColor,
      }}
    >
    </div>
  );
}
function onMouseDown(event: MouseEvent, setRect: (rect: Rect) => void) {
  event.stopImmediatePropagation();
  event.preventDefault();
  const { clientX, clientY } = event;
  setRect({ left: clientX + window.scrollX, top: clientY + window.scrollY, width: 1, height: 1 });
  const { scrollHeight, scrollWidth } = document.documentElement;
  const getRect = (e: MouseEvent) => {
    let left = clientX + window.scrollX;
    let top = clientY + window.scrollY;
    let width = e.clientX - clientX;
    let height = e.clientY - clientY;
    if (width < 0) {
      left += width;
      width = -width;
    }
    if (height < 0) {
      top += height;
      height = -height;
    }
    if (width < 1) width = 1;
    if (height < 1) height = 1;
    if (left + width > scrollWidth) width = scrollWidth - left;
    if (top + height > scrollHeight) height = scrollHeight - top;
    return { left, top, width, height };
  };
  const onMouseMove = (e: MouseEvent) => {
    e.stopImmediatePropagation();
    setRect(getRect(e));
  };
  const onMouseUp = (e: MouseEvent) => {
    document.removeEventListener('mousemove', onMouseMove, { capture: true });
    const { left, top, width, height } = getRect(e);
    const rect: MarkRect = { x: left, y: top, w: width, h: height };
    const marks = getDefaultStore().get(marksAtom);
    const key = marks.reduce((p, x) => Math.max(p, x.key), 0) + 1;
    const next = [...marks, { type: InstanceType.IMAGE, key, rect }];
    const s = getDefaultStore();
    setMarks(() => next);
    s.set(creatingAtom, false);
    s.set(focusKeyAtom, key);
  };
  document.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  }, { capture: true, once: true });
  document.addEventListener('mousemove', onMouseMove, { capture: true });
  document.addEventListener('mouseup', onMouseUp, { capture: true, once: true });
}
