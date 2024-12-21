import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';

import { captureEvents } from '~/capture/capture.events.js';

import { captrueDataAtom, capturePickerAtom, captureRunningAtom } from '../atoms.js';
import Resizing from '../components/Resizing.js';
import { MarkRect } from '../modules/base/base.js';

import './Capture.scss';

interface Rect {
  x: number; y: number; w: number; h: number;
}

export default function Capture(): React.ReactNode {
  const [rect, setRect] = useState<Rect | null>(null);
  const [draggable, setDragable] = useState<HTMLElement | null>(null);
  const creating = useCreateRect(draggable, setRect);
  const setCapture = useSetAtom(capturePickerAtom);
  const setRunning = useSetAtom(captureRunningAtom);
  const setCaptrueData = useSetAtom(captrueDataAtom);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      onKeydown(e, setCapture, setRect);
    };
    document.addEventListener('keydown', handle, { capture: true });
    return () => {
      document.removeEventListener('keydown', handle, { capture: true });
    };
  }, [setCapture, setRect]);
  useEffect(() => {
    if (creating) return;
    captureEvents.emit('set_capture_rect', rect);
    return () => {
      captureEvents.emit('set_capture_rect', null);
    };
  }, [rect, creating]);
  useEffect(() => captureEvents.subscribe('capture_complete', ({ dataUrl, x, y, w, h, dpr }) => {
    setCapture(false);
    setRunning(false);
    setCaptrueData({ dataUrl, x, y, w, h, dpr });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'screenshot.png';
    link.click();
  }), [setCapture, setCaptrueData, setRunning]);
  useEffect(() => captureEvents.subscribe('capture_start', () => {
    setRunning(true);
  }), [setRunning]);

  if (rect === null) {
    return <div className="crx-capture-empty" />;
  }
  // 截屏区域的大小
  return (
    <div
      ref={setDragable}
      className="crx-capture"
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    >
      {draggable && <Resizing draggable={draggable} rect={rect} onRect={setRect} />}
      {!creating && (
        <div className="crx-capture-tip">右键菜单选择截屏</div>
      )}
    </div>
  );
}

function useCreateRect(draggable: HTMLElement | null, setRect: (rect: Rect) => void) {
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (draggable && (draggable === target || draggable.contains(target))) return;
      setCreating(true);
      event.stopImmediatePropagation();
      event.preventDefault();
      const { clientX, clientY } = event;
      setRect({ x: Math.round(clientX + window.scrollX), y: Math.round(clientY + window.scrollY), w: 1, h: 1 });
      const { scrollHeight, scrollWidth } = document.documentElement;
      const onMouseMove = (e: MouseEvent) => {
        e.stopImmediatePropagation();
        let left = Math.round(clientX + window.scrollX);
        let top = Math.round(clientY + window.scrollY);
        let width = Math.round(e.clientX - clientX);
        let height = Math.round(e.clientY - clientY);
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
        setRect({ x: left, y: top, w: width, h: height });
      };
      const onMouseUp = () => {
        setCreating(false);
        document.removeEventListener('mousemove', onMouseMove, { capture: true });
      };
      document.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
      }, { capture: true, once: true });
      document.addEventListener('mousemove', onMouseMove, { capture: true });
      document.addEventListener('mouseup', onMouseUp, { capture: true, once: true });
    };

    document.addEventListener('mousedown', onMouseDown, { capture: true });
    return () => {
      document.removeEventListener('mousedown', onMouseDown, { capture: true });
    };
  }, [draggable, setRect]);
  return creating;
}

function onKeydown(e: KeyboardEvent, setCapture: (v: boolean) => void, setRect: React.Dispatch<React.SetStateAction<MarkRect | null>>) {
  if (e.code === 'Escape') {
    e.preventDefault();
    e.stopImmediatePropagation();
    setCapture(false);
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    e.stopImmediatePropagation();
    setRect((rect) => rect && rect.x > 0 ? { ...rect, x: rect.x - 1 } : rect);
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    e.stopImmediatePropagation();
    const { scrollWidth } = document.documentElement;
    setRect((rect) => {
      if (!rect) return rect;
      if (rect.x + rect.w < scrollWidth) return { ...rect, x: rect.x + 1 };
      return rect;
    });
  } else if (e.code === 'ArrowUp') {
    e.preventDefault();
    e.stopImmediatePropagation();
    setRect((rect) => rect && rect.y > 0 ? { ...rect, y: rect.y - 1 } : rect);
  } else if (e.code === 'ArrowDown') {
    e.preventDefault();
    e.stopImmediatePropagation();
    const { scrollHeight } = document.documentElement;
    setRect((rect) => {
      if (!rect) return rect;
      if (rect.y + rect.h < scrollHeight) return { ...rect, y: rect.y + 1 };
      return rect;
    });
  }
}
