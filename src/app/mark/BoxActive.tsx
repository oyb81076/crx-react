import { memo } from 'react';
import clsx from 'clsx';
import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';

import { Instance } from '~/app/modules/instance/instanceModels.js';

import { cmdKeyDownAtom, configAtom, focusKeyAtom, movingAtom } from '../atoms.js';
import { isContainRect } from '../modules/base/rectUtils.js';
import { setMark, setMarks } from '../modules/setMarks.js';

import './Box.scss';

// 外边框vs内边框, 我们选择外边框
interface Props {
  mark: Instance;
  state: 'hover' | 'active';
}

// 表明节点是激活状态, 可以进行拖拽，属性编辑, 可以点击
function ActiveBox({ mark, state }: Props): React.ReactNode {
  const config = useAtomValue(configAtom);
  const { left, top, width, height } = mark.rect;
  const { backgroundColor, color, borderColor } = config.colors[mark.type];
  const setFocusKey = useSetAtom(focusKeyAtom);
  const isCmdKeyDown = useAtomValue(cmdKeyDownAtom);
  return (
    <div
      className={clsx('crx-mark crx-active', 'crx-' + state, isCmdKeyDown && 'crx-cmd')}
      onMouseDown={((e) => {
        if (e.button !== 0) return;
        if (!isCmdKeyDown) return;
        onMouseDown(e, e.currentTarget, mark);
      })}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) {
          setMark(config.nextType(mark));
        } else {
          setFocusKey(mark.key);
        }
      }}
      style={{
        left, top, width, height,
        backgroundColor,
        color,
        border: `1px solid ${borderColor}`,
      }}
    >
      {config.titles[mark.type] + mark.key}
    </div>
  );
}

const onMouseDown = (e: React.MouseEvent, draggable: HTMLDivElement, mark: Instance) => {
  const rect = mark.rect;
  if (!isContainRect(e, rect)) {
    return;
  }
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
    setMarks((arr) => arr.map((x) => {
      if (x.key !== mark.key) return x;
      return { ...mark, rect: { ...mark.rect, left, top } };
    }));
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
};

export default memo(ActiveBox);
