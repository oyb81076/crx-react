import { useEffect, useRef } from 'react';

import { MarkRect } from '../modules/base/base.js';

interface Props {
  draggable: HTMLElement;
  onMoveStart?: () => void;
  onMoveEnd?: () => void;
  rect: MarkRect;
  onRect: (value: MarkRect) => void;
}
export default function Resizing(props: Props): React.ReactNode {
  const { draggable } = props;
  const ref = useRef(props);
  ref.current = props;
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      onMove(e, ref.current);
    };
    draggable.addEventListener('mousedown', onMouseDown);
    return () => {
      draggable.removeEventListener('mousedown', onMouseDown);
    };
  }, [draggable]);
  return (
    <>
      <div
        style={{ position: 'absolute', userSelect: 'none',
          cursor: 'ns-resize', top: 0, right: 0, left: 0, height: 5 }}
        onMouseDownCapture={(e) => onTop(e.nativeEvent, props)}
      />
      <div
        style={{ position: 'absolute', userSelect: 'none',
          cursor: 'ew-resize', top: 0, bottom: 0, left: 0, width: 5 }}
        onMouseDownCapture={(e) => onLeft(e.nativeEvent, props)}
      />
      <div
        style={{ position: 'absolute', userSelect: 'none',
          cursor: 'ns-resize', right: 5, bottom: 0, left: 0, height: 5 }}
        onMouseDownCapture={(e) => onBottom(e.nativeEvent, props)}
      />
      <div
        style={{ position: 'absolute', userSelect: 'none',
          cursor: 'ew-resize', top: 0, right: 0, bottom: 0, width: 5 }}
        onMouseDownCapture={(e) => onRight(e.nativeEvent, props)}
      />
      <div
        style={{ position: 'absolute', userSelect: 'none',
          cursor: 'nesw-resize', bottom: 0, left: 0, width: 5, height: 5 }}
        onMouseDownCapture={(e) => onBottomLeft(e.nativeEvent, props)}
      />
      <div
        style={{ position: 'absolute', userSelect: 'none',
          cursor: 'nwse-resize', right: 0, bottom: 0, width: 5, height: 5 }}
        onMouseDownCapture={(e) => onBottomRight(e.nativeEvent, props)}
      />
      <div
        style={{ position: 'absolute', userSelect: 'none',
          cursor: 'nesw-resize', top: 0, right: 0, width: 5, height: 5 }}
        onMouseDownCapture={(e) => onTopRight(e.nativeEvent, props)}
      />
      <div
        style={{ position: 'absolute', userSelect: 'none',
          cursor: 'nwse-resize', top: 0, left: 0, width: 5, height: 5 }}
        onMouseDownCapture={(e) => onTopLeft(e.nativeEvent, props)}
      />
    </>
  );
}

function onTop(e: MouseEvent, { draggable, rect, onMoveStart, onMoveEnd, onRect }: Props) {
  if (e.button !== 0) return;
  e.stopImmediatePropagation();
  e.stopPropagation();
  const clientY = e.clientY;
  let height = rect.h;
  let top = rect.y;
  const maxTop = rect.y + rect.h - 1;
  let moving = false;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      onMoveStart?.();
    }
    const deltaY = event.clientY - clientY;
    top = Math.round(rect.y + deltaY);
    if (top > maxTop) top = maxTop;
    if (top < 0) top = 0;
    height = rect.h + (rect.y - top);
    draggable.style.height = `${height}px`;
    draggable.style.top = `${top}px`;
  };
  const handleFinish = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
    if (!moving) return;
    onMoveEnd?.();
    stopClickOnce();
    if (height === rect.h && top === rect.y) return;
    onRect({ ...rect, y: top, h: height });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
}

function onLeft(e: MouseEvent, { draggable, rect, onMoveStart, onMoveEnd, onRect }: Props) {
  if (e.button !== 0) return;
  e.stopPropagation();
  const clientX = e.clientX;
  let width = rect.w;
  let left = rect.x;
  const maxLeft = rect.x + rect.w - 1;
  let moving = false;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      onMoveStart?.();
    }
    const deltaX = event.clientX - clientX;
    left = Math.round(rect.x + deltaX);
    if (left > maxLeft) left = maxLeft;
    if (left < 0) left = 0;
    width = rect.w + (rect.x - left);
    draggable.style.width = `${width}px`;
    draggable.style.left = `${left}px`;
  };
  const handleFinish = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
    if (!moving) return;
    onMoveEnd?.();
    stopClickOnce();
    if (width === rect.w && left === rect.x) return;
    onRect({ ...rect, x: left, w: width });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

function onRight(e: MouseEvent, { draggable, rect, onMoveStart, onMoveEnd, onRect }: Props) {
  if (e.button !== 0) return;
  e.stopPropagation();
  console.log('stopped');
  const clientX = e.clientX;
  let width = rect.w;
  const { scrollWidth } = document.documentElement;
  const maxWidth = scrollWidth - rect.x;
  let moving = false;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      onMoveStart?.();
    }
    width = event.clientX - clientX + rect.w;
    width = Math.max(1, Math.min(width, maxWidth)); // 限制在 [0, 视口宽度 - 元素宽度]
    width = Math.round(width);
    draggable.style.width = `${width}px`;
  };
  const handleFinish = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
    if (!moving) return;
    onMoveEnd?.();
    stopClickOnce();
    if (width === rect.w) return;
    onRect({ ...rect, w: width });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
}

function onBottom(e: MouseEvent, { draggable, rect, onMoveStart, onMoveEnd, onRect }: Props) {
  if (e.button !== 0) return;
  e.stopPropagation();
  const clientY = e.clientY;
  let height = rect.h;
  let moving = false;
  const { scrollHeight } = document.documentElement;
  const maxHeight = scrollHeight - rect.y;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      onMoveStart?.();
    }
    height = event.clientY - clientY + rect.h;
    height = Math.max(1, Math.min(height, maxHeight)); // 限制在 [0, 视口高度 - 元素高度]
    height = Math.round(height);
    draggable.style.height = `${height}px`;
  };
  const handleFinish = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
    if (!moving) return;
    onMoveEnd?.();
    stopClickOnce();
    if (height === rect.h) return;
    onRect({ ...rect, h: height });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
}

function onTopLeft(e: MouseEvent, { draggable, rect, onMoveStart, onMoveEnd, onRect }: Props) {
  if (e.button !== 0) return;
  e.stopPropagation();
  const clientX = e.clientX;
  const clientY = e.clientY;
  let width = rect.w;
  let height = rect.h;
  let left = rect.x;
  let top = rect.y;
  let moving = false;
  const maxWidth = rect.w + rect.x;
  const maxHeight = rect.h + rect.y;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      onMoveStart?.();
    }
    const deltaX = event.clientX - clientX;
    const deltaY = event.clientY - clientY;
    width = rect.w - deltaX;
    height = rect.h - deltaY;
    width = Math.max(1, Math.min(width, maxWidth)); // 限制在 [0, 视口宽度 - 元素宽度]
    height = Math.max(1, Math.min(height, maxHeight)); // 限制在 [0, 视口高度 - 元素高度]
    width = Math.round(width);
    height = Math.round(height);
    left = rect.x + rect.w - width;
    top = rect.y + rect.h - height;
    draggable.style.width = `${width}px`;
    draggable.style.height = `${height}px`;
    draggable.style.left = `${left}px`;
    draggable.style.top = `${top}px`;
  };
  const handleFinish = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
    if (!moving) return;
    onMoveEnd?.();
    stopClickOnce();
    if (width === rect.w && height === rect.h && rect.x === left && rect.x === top) return;
    onRect({ x: left, y: top, w: width, h: height });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
}

function onBottomLeft(e: MouseEvent, { draggable, rect, onMoveStart, onMoveEnd, onRect }: Props) {
  if (e.button !== 0) return;
  e.stopPropagation();
  const clientX = e.clientX;
  const clientY = e.clientY;
  let width = rect.w;
  let height = rect.h;
  let left = rect.x;
  let moving = false;
  const { scrollHeight } = document.documentElement;
  const maxHeight = scrollHeight - rect.y;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      onMoveStart?.();
    }
    const deltaX = event.clientX - clientX;
    const deltaY = event.clientY - clientY;
    width = rect.w - deltaX;
    height = rect.h + deltaY;
    width = Math.max(1, Math.min(width, rect.w + rect.x)); // 限制在 [0, 元素宽度 + 元素x]
    height = Math.max(1, Math.min(height, maxHeight)); // 限制在 [0, 视口高度 - 元素高度]
    width = Math.round(width);
    height = Math.round(height);
    left = rect.x + rect.w - width;
    draggable.style.width = `${width}px`;
    draggable.style.height = `${height}px`;
    draggable.style.left = `${left}px`;
  };
  const handleFinish = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
    if (!moving) return;
    onMoveEnd?.();
    stopClickOnce();
    if (width === rect.w && height === rect.h && rect.x === left) return;
    onRect({ x: left, y: rect.y, w: width, h: height });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
}

function onBottomRight(e: MouseEvent, { draggable, rect, onMoveStart, onMoveEnd, onRect }: Props) {
  if (e.button !== 0) return;
  e.stopPropagation();
  const clientX = e.clientX;
  const clientY = e.clientY;
  let width = rect.w;
  let height = rect.h;
  let moving = false;
  const { scrollWidth, scrollHeight } = document.documentElement;
  const maxWidth = scrollWidth - rect.x;
  const maxHeight = scrollHeight - rect.y;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      onMoveStart?.();
    }
    width = event.clientX - clientX + rect.w;
    height = event.clientY - clientY + rect.h;
    width = Math.max(1, Math.min(width, maxWidth)); // 限制在 [0, 视口宽度 - 元素宽度]
    height = Math.max(1, Math.min(height, maxHeight)); // 限制在 [0, 视口高度 - 元素高度]
    width = Math.round(width);
    height = Math.round(height);
    draggable.style.width = `${width}px`;
    draggable.style.height = `${height}px`;
  };
  const handleFinish = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
    if (!moving) return;
    onMoveEnd?.();
    stopClickOnce();
    if (width === rect.w && height === rect.h) return;
    onRect({ ...rect, w: width, h: height });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
}

const onTopRight = (e: MouseEvent, { draggable, rect, onMoveStart, onMoveEnd, onRect }: Props) => {
  if (e.button !== 0) return;
  e.stopPropagation();
  const clientX = e.clientX;
  const clientY = e.clientY;
  let width = rect.w;
  let height = rect.h;
  let top = rect.y;
  let moving = false;
  const { scrollWidth } = document.documentElement;
  const maxHeight = rect.h + rect.y;
  const maxWidth = scrollWidth - rect.x;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      onMoveStart?.();
    }
    const deltaY = event.clientY - clientY;
    const deltaX = event.clientX - clientX;
    height = rect.h - deltaY;
    width = rect.w + deltaX;
    height = Math.max(1, Math.min(height, maxHeight)); // 限制在 [0, 视口高度 - 元素高度]
    width = Math.max(1, Math.min(width, maxWidth)); // 限制在 [0, 视口宽度 - 元素宽度]
    height = Math.round(height);
    width = Math.round(width);
    top = rect.y + rect.h - height;
    draggable.style.height = `${height}px`;
    draggable.style.width = `${width}px`;
    draggable.style.top = `${top}px`;
  };
  const handleFinish = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
    if (!moving) return;
    onMoveEnd?.();
    stopClickOnce();
    if (width === rect.w && height === rect.h && rect.y === top) return;
    onRect({ x: rect.x, y: top, w: width, h: height });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

const onMove = (e: MouseEvent, { draggable, rect, onMoveStart, onMoveEnd, onRect }: Props) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.button !== 0) return;
  const clientX = e.clientX;
  const clientY = e.clientY;
  let left = rect.x;
  let top = rect.y;
  const { scrollWidth, scrollHeight } = document.documentElement;
  const maxLeft = scrollWidth - rect.w;
  const maxTop = scrollHeight - rect.h;
  let moving = false;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      onMoveStart?.();
    }
    left = event.clientX - clientX + rect.x;
    top = event.clientY - clientY + rect.y;
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
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
    draggable.style.pointerEvents = '';
    draggable.style.cursor = '';
    if (!moving) return;
    onMoveEnd?.();
    stopClickOnce();
    onRect({ x: left, y: top, w: rect.w, h: rect.h });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

function stopClickOnce() {
  document.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
  }, { once: true, capture: true });
}
