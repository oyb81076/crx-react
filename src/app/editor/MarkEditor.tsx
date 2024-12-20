import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import { configAtom, editorAtom } from '../atoms.js';
import { fixRect, isEqualRect } from '../modules/base/rectUtils.js';
import { Instance, InstanceType } from '../modules/instance/instanceModels.js';
import { setMark, setMarks } from '../modules/setMarks.js';

import './MarkEditor.scss';

export default function MarkEditor(): React.ReactNode {
  const editor = useAtomValue(editorAtom);
  if (!editor) return null;
  return <Inner key={editor.key} mark={editor} />;
}

function Inner({ mark }: { mark: Instance }): React.ReactNode {
  const config = useAtomValue(configAtom);
  const [type, setType] = useState<InstanceType>(mark.type);
  const [x, setX] = useState<number>(mark.rect.x);
  const [y, setY] = useState<number>(mark.rect.y);
  const [width, setWidth] = useState<number>(mark.rect.w);
  const [height, setHeight] = useState<number>(mark.rect.h);
  const setEditor = useSetAtom(editorAtom);
  return (
    <div className="crx-modal">
      <section>
        <header onMouseDown={onMouseDown}>
          <span>修改标签</span>
          <button type="button" onClick={() => setEditor(null)}>&times;</button>
        </header>
        <form onSubmit={(e) => {
          e.preventDefault();
          const rect = fixRect({ x, y, w: width, h: height });
          if (type !== mark.type || !isEqualRect(rect, mark.rect)) {
            setMark({ ...mark, type, rect });
          }
          setEditor(null);
        }}
        >
          <main>
            <div className="crx-form-group">
              <label className="crx-form-label">类型</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {config.types.map((tp) => (
                  <label key={tp} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      style={{ margin: 0 }}
                      type="radio"
                      value={tp}
                      checked={tp === type}
                      onChange={() => setType(tp)}
                    />
                    <span>{config.titles[tp]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="crx-form-group">
              <label className="crx-form-label">x</label>
              <input
                className="crx-form-control"
                type="number"
                value={x}
                onChange={(e) => setX(e.currentTarget.valueAsNumber)}
              />
            </div>
            <div className="crx-form-group">
              <label className="crx-form-label">y</label>
              <input
                className="crx-form-control"
                type="number"
                value={y}
                onChange={(e) => setY(e.currentTarget.valueAsNumber)}
              />
            </div>
            <div className="crx-form-group">
              <label className="crx-form-label">width</label>
              <input
                className="crx-form-control"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.currentTarget.valueAsNumber)}
              />
            </div>
            <div className="crx-form-group">
              <label className="crx-form-label">height</label>
              <input
                className="crx-form-control"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.currentTarget.valueAsNumber)}
              />
            </div>
          </main>
          <footer>
            <button
              type="button"
              style={{ border: 0, background: 'none', color: 'red' }}
              onClick={() => {
                setEditor(null);
                setMarks((arr) => arr.filter((x) => x !== mark));
              }}
            >
              删除
            </button>
            <button type="submit" disabled={[x, y, width, height].some(Number.isNaN)}>
              确定
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function onMouseDown(e: React.MouseEvent) {
  if (e.button !== 0) return;
  if (e.target instanceof HTMLButtonElement) return;
  const draggable = e.currentTarget.parentElement as HTMLDivElement;
  if (!draggable) return;
  e.preventDefault();
  e.stopPropagation();
  const clientX = e.clientX;
  const clientY = e.clientY;
  const { clientWidth, clientHeight } = document.documentElement;
  const { offsetLeft, offsetTop } = draggable;
  const maxLeft = clientWidth - draggable.clientWidth;
  const maxTop = clientHeight - draggable.clientHeight;
  const handleMove = (event: MouseEvent) => {
    let left = event.clientX - clientX + offsetLeft;
    let top = event.clientY - clientY + offsetTop;
    left = Math.max(0, Math.min(left, maxLeft)); // 限制在 [0, 视口宽度 - 元素宽度]
    top = Math.max(0, Math.min(top, maxTop)); // 限制在 [0, 视口高度 - 元素高度]
    left = Math.round(left);
    top = Math.round(top);
    draggable.style.position = 'absolute';
    draggable.style.left = `${left}px`;
    draggable.style.top = `${top}px`;
  };
  const handleFinish = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('mousemove', handleMove, { capture: true });
    document.removeEventListener('mouseup', handleFinish, { capture: true });
  };
  document.addEventListener('mousemove', handleMove, { capture: true });
  document.addEventListener('mouseup', handleFinish, { capture: true });
}
