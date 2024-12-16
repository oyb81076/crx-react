import clsx from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';

import { Mark } from '~/models/mark.js';

import { creatorAtom, marksAtom } from '../atoms.js';

import './Boxes.scss';

export default function Boxes(): React.ReactNode {
  const creator = useAtomValue(creatorAtom);
  return creator && <Inner />;
}
function Inner(): React.ReactNode {
  const marks = useAtomValue(marksAtom);
  return marks.map((x) => <SimpleMark key={x.key} mark={x} />);
}

function SimpleMark({ mark }: { mark: Mark }): React.ReactNode {
  const setMarks = useSetAtom(marksAtom);
  const border = 1;
  const rect = mark.rect;
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
  // 方案1 用四个div做四个边
  return (
    <div className="crx-box" style={{ left, top, width, height }}>
      <div className={clsx('crx-mark-tag', {
        'crx-in': top <= 20,
        'crx-right': left >= document.documentElement.clientWidth - 100,
      })}
      >
        {mark.type}
        <button
          role="button"
          className="crx-box-rm"
          onClick={(e) => {
            e.preventDefault();
            setMarks((arr) => arr.filter((x) => x.key !== mark.key));
          }}
        >
          x
        </button>
      </div>
    </div>
  );
}
