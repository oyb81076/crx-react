import { memo } from 'react';
import clsx from 'clsx';
import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';

import { Instance } from '~/app/modules/instance/instanceModels.js';

import { configAtom, editorAtom, focusKeyAtom, movingAtom } from '../atoms.js';
import { setMark } from '../modules/setMarks.js';

import './Box.scss';

// 外边框vs内边框, 我们选择外边框
interface Props {
  mark: Instance;
  state: 'hover' | 'active';
}

// 表明节点是激活状态, 可以进行拖拽，属性编辑, 可以点击
function ActiveBox({ mark, state }: Props): React.ReactNode {
  const config = useAtomValue(configAtom);
  const { x: left, y: top, w: width, h: height } = mark.rect;
  const { backgroundColor, color } = config.colors[mark.type];
  const setFocusKey = useSetAtom(focusKeyAtom);
  const setEditor = useSetAtom(editorAtom);
  return (
    <div
      data-key={mark.key}
      className={clsx('crx-mark crx-active', 'crx-' + state, 'crx-cmd')}
      onMouseDown={((e) => {
        if (e.button !== 0) return;
        onMove(e, mark);
      })}
      onClick={() => setFocusKey(mark.key)}
      onDoubleClick={() => setEditor(mark)}
      style={{
        left, top, width, height,
        backgroundColor,
        color,
      }}
    >
      {config.titles[mark.type] + mark.key}
      <div className="crx-resize-top" onMouseDown={(e) => onResizeTop(e, mark)}></div>
      <div className="crx-resize-left" onMouseDown={(e) => onResizeLeft(e, mark)}></div>
      <div className="crx-resize-bottom" onMouseDown={(e) => onResizeBottom(e, mark)}></div>
      <div className="crx-resize-right" onMouseDown={(e) => onResizeRight(e, mark)}></div>
      <div className="crx-resize-bottom-left" onMouseDown={(e) => onResizeBottomLeft(e, mark)}></div>
      <div className="crx-resize-bottom-right" onMouseDown={(e) => onResizeBottomRight(e, mark)}></div>
      <div className="crx-resize-top-right" onMouseDown={(e) => onResizeTopRight(e, mark)}></div>
      <div className="crx-resize-top-left" onMouseDown={(e) => onResizeTopLeft(e, mark)}></div>
    </div>
  );
}

const onResizeTop = (e: React.MouseEvent, mark: Instance) => {
  e.stopPropagation();
  const s = getDefaultStore();
  const rect = mark.rect;
  const draggable = (e.currentTarget as HTMLDivElement).parentElement as HTMLDivElement;
  const clientY = e.clientY;
  let height = rect.h;
  let top = rect.y;
  const maxTop = rect.y + rect.h - 1;
  let moving = false;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      s.set(movingAtom, true);
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
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
    }, { once: true, capture: true });
    s.set(focusKeyAtom, mark.key);
    if (height === rect.h && top === rect.y) return;
    setMark({ ...mark, rect: { ...mark.rect, y: top, h: height } });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

const onResizeLeft = (e: React.MouseEvent, mark: Instance) => {
  e.stopPropagation();
  const s = getDefaultStore();
  const rect = mark.rect;
  const draggable = (e.currentTarget as HTMLDivElement).parentElement as HTMLDivElement;
  const clientX = e.clientX;
  let width = rect.w;
  let left = rect.x;
  const maxLeft = rect.x + rect.w - 1;
  let moving = false;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      s.set(movingAtom, true);
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
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
    }, { once: true, capture: true });
    s.set(focusKeyAtom, mark.key);
    if (width === rect.w && left === rect.x) return;
    setMark({ ...mark, rect: { ...mark.rect, x: left, w: width } });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

const onResizeRight = (e: React.MouseEvent, mark: Instance) => {
  e.stopPropagation();
  const s = getDefaultStore();
  const rect = mark.rect;
  const draggable = (e.currentTarget as HTMLDivElement).parentElement as HTMLDivElement;
  const clientX = e.clientX;
  let width = rect.w;
  const { scrollWidth } = document.documentElement;
  const maxWidth = scrollWidth - rect.x;
  let moving = false;
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      s.set(movingAtom, true);
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
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
    }, { once: true, capture: true });
    s.set(focusKeyAtom, mark.key);
    if (width === rect.w) return;
    setMark({ ...mark, rect: { ...mark.rect, w: width } });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

const onResizeBottom = (e: React.MouseEvent, mark: Instance) => {
  e.stopPropagation();
  const rect = mark.rect;
  const draggable = (e.currentTarget as HTMLDivElement).parentElement as HTMLDivElement;
  const clientY = e.clientY;
  let height = rect.h;
  let moving = false;
  const { scrollHeight } = document.documentElement;
  const maxHeight = scrollHeight - rect.y;
  const s = getDefaultStore();
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      s.set(movingAtom, true);
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
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
    }, { once: true, capture: true });
    s.set(focusKeyAtom, mark.key);
    if (height === rect.h) return;
    setMark({ ...mark, rect: { ...mark.rect, h: height } });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

const onResizeTopLeft = (e: React.MouseEvent, mark: Instance) => {
  e.stopPropagation();
  const rect = mark.rect;
  const draggable = (e.currentTarget as HTMLDivElement).parentElement as HTMLDivElement;
  const clientX = e.clientX;
  const clientY = e.clientY;
  let width = rect.w;
  let height = rect.h;
  let left = rect.x;
  let top = rect.y;
  let moving = false;
  const maxWidth = rect.w + rect.x;
  const maxHeight = rect.h + rect.y;
  const s = getDefaultStore();
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      s.set(movingAtom, true);
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
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
    }, { once: true, capture: true });
    s.set(focusKeyAtom, mark.key);
    if (width === rect.w && height === rect.h && rect.x === left && rect.x === top) return;
    setMark({ ...mark, rect: { x: left, y: top, w: width, h: height } });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

const onResizeBottomLeft = (e: React.MouseEvent, mark: Instance) => {
  e.stopPropagation();
  const rect = mark.rect;
  const draggable = (e.currentTarget as HTMLDivElement).parentElement as HTMLDivElement;
  const clientX = e.clientX;
  const clientY = e.clientY;
  let width = rect.w;
  let height = rect.h;
  let left = rect.x;
  let moving = false;
  const { scrollHeight } = document.documentElement;
  const maxHeight = scrollHeight - rect.y;
  const s = getDefaultStore();
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      s.set(movingAtom, true);
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
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
    }, { once: true, capture: true });
    s.set(focusKeyAtom, mark.key);
    if (width === rect.w && height === rect.h && rect.x === left) return;
    setMark({ ...mark, rect: { x: left, y: rect.y, w: width, h: height } });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

const onResizeBottomRight = (e: React.MouseEvent, mark: Instance) => {
  e.stopPropagation();
  const rect = mark.rect;
  const draggable = (e.currentTarget as HTMLDivElement).parentElement as HTMLDivElement;
  const clientX = e.clientX;
  const clientY = e.clientY;
  let width = rect.w;
  let height = rect.h;
  let moving = false;
  const { scrollWidth, scrollHeight } = document.documentElement;
  const maxWidth = scrollWidth - rect.x;
  const maxHeight = scrollHeight - rect.y;
  const s = getDefaultStore();
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      s.set(movingAtom, true);
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
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
    }, { once: true, capture: true });
    s.set(focusKeyAtom, mark.key);
    if (width === rect.w && height === rect.h) return;
    setMark({ ...mark, rect: { ...mark.rect, w: width, h: height } });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

const onResizeTopRight = (e: React.MouseEvent, mark: Instance) => {
  e.stopPropagation();
  const rect = mark.rect;
  const draggable = (e.currentTarget as HTMLDivElement).parentElement as HTMLDivElement;
  const clientX = e.clientX;
  const clientY = e.clientY;
  let width = rect.w;
  let height = rect.h;
  let top = rect.y;
  let moving = false;
  const { scrollWidth } = document.documentElement;
  const maxHeight = rect.h + rect.y;
  const maxWidth = scrollWidth - rect.x;
  const s = getDefaultStore();
  const handleMove = (event: MouseEvent) => {
    if (!moving) {
      moving = true;
      s.set(movingAtom, true);
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
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
    }, { once: true, capture: true });
    s.set(focusKeyAtom, mark.key);
    if (width === rect.w && height === rect.h && rect.y === top) return;
    setMark({ ...mark, rect: { x: rect.x, y: top, w: width, h: height } });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

const onMove = (e: React.MouseEvent, mark: Instance) => {
  const rect = mark.rect;
  const draggable = e.currentTarget as HTMLDivElement;
  e.preventDefault();
  e.stopPropagation();
  const s = getDefaultStore();
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
      s.set(movingAtom, true);
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
    s.set(movingAtom, false);
    if (!moving) return;
    document.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
    }, { once: true, capture: true });
    s.set(focusKeyAtom, mark.key);
    setMark({ ...mark, rect: { ...mark.rect, x: left, y: top } });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

export default memo(ActiveBox);
