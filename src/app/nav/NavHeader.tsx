import { getDefaultStore, useAtom, useSetAtom } from 'jotai';

import { capturePickerAtom, creatingAtom, focusKeyAtom, navBodyAtom, NavBodyType, navPosAtom } from '../atoms.js';

export default function NavHeader(): React.ReactNode {
  const setBody = useSetAtom(navBodyAtom);
  const [creating, setCreating] = useAtom(creatingAtom);
  const setCapture = useSetAtom(capturePickerAtom);
  const setFocusKey = useSetAtom(focusKeyAtom);
  return (
    <header className="crx-nav-header" onMouseDown={onMouseDown}>
      <button
        role="button"
        onClick={() => {
          setCapture(true);
          setFocusKey(null);
        }}
      >截图
      </button>
      <button
        role="button"
        onClick={() => setBody((x) => x === NavBodyType.MARK ? NavBodyType.NONE : NavBodyType.MARK)}
      >
        标注
      </button>
      <button
        role="button"
        onClick={() => setBody((x) => x === NavBodyType.HELP ? NavBodyType.NONE : NavBodyType.HELP)}
      >
        快捷键
      </button>
      <button
        role="button"
        onClick={() => setCreating((x) => !x)}
      >
        {creating ? '取消(Esc)' : '添加标注'}
      </button>
    </header>
  );
}

const onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
  if (e.currentTarget !== e.target) return;
  const draggable = e.currentTarget.parentElement;
  if (!draggable) return;
  const offsetX = e.clientX - draggable.offsetLeft;
  const offsetY = e.clientY - draggable.offsetTop;
  let left = e.clientX - offsetX;
  let top = e.clientY - offsetY;
  draggable.style.cursor = 'grabbing';
  const handleMove = (event: MouseEvent) => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    left = event.clientX - offsetX;
    top = event.clientY - offsetY;
    const elementWidth = draggable.offsetWidth;
    const elementHeight = draggable.offsetHeight;
    left = Math.max(0, Math.min(left, viewportWidth - elementWidth)); // 限制在 [0, 视口宽度 - 元素宽度]
    top = Math.max(0, Math.min(top, viewportHeight - elementHeight)); // 限制在 [0, 视口高度 - 元素高度]
    draggable.style.left = `${left}px`;
    draggable.style.top = `${top}px`;
  };
  const handleFinish = (event: Event) => {
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleFinish);
    getDefaultStore().set(navPosAtom, { left, top });
  };
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleFinish);
};
