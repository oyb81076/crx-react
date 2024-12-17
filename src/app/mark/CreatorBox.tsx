import { memo, useEffect } from 'react';
import clsx from 'clsx';
import { getDefaultStore } from 'jotai';

import { Mark } from '~/models/mark.js';

import { focusKeyAtom, marksAtom } from '../atoms.js';
import { isCrxElement } from '../modules/isCrxElement.js';
import markName from '../modules/markName.js';
import { isContainRect } from '../modules/rectUtils.js';
import { setMarks } from '../modules/setMarks.js';
import { isMarkOutside, isMarkRight } from './boxUtils.js';

import './Box.scss';

// 外边框vs内边框, 我们选择外边框
interface Props {
  mark: Mark;
  creator?: boolean;
}

function CreatorBox({ mark }: Props): React.ReactNode {
  const rect = mark.rect;
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (isCrxElement(e.target)) return;
      if (!isContainRect(e, mark.rect)) return;
      e.preventDefault();
      e.stopPropagation();
      const s = getDefaultStore();
      const marks = s.get(marksAtom);
      const key = marks.reduce((p, x) => Math.max(p, x.key), 0) + 1;
      setMarks((x) => [...x, { ...mark, key }]);
      s.set(focusKeyAtom, key);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
    };
  }, [mark]);
  return (
    <div className={clsx('crx-simple-box crx-simple-creator')} style={rect}>
      <div className={clsx('crx-simple-tag',
        isMarkRight(rect) && 'crx-right',
        isMarkOutside(mark) && 'crx-outside',
      )}
      >
        {markName(mark)}
      </div>
    </div>
  );
}
export default memo(CreatorBox);
