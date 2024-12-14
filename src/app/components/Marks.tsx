import clsx from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';

import { Mark } from '~/models/mark.js';

import { marksAtom } from '../atoms.js';

export default function Marks(): React.ReactNode {
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
  return (
    <div className="crx-simple-mark" style={{ left, top, width, height }}>
      <div className={clsx('crx-mark-tag', {
        'crx-in': top <= 20,
        'crx-right': left >= document.documentElement.clientWidth - 100,
      })}
      >
        {mark.type}
        <span
          className="crx-mark-remove"
          onClick={(e) => {
            e.preventDefault();
            console.log('click remove!!!');
            setMarks((arr) => arr.filter((x) => x.key !== mark.key));
          }}
        >
          x
        </span>
      </div>
    </div>
  );
}
