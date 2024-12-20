import { memo, useEffect } from 'react';
import { getDefaultStore, useAtomValue } from 'jotai';

import { Instance } from '~/app/modules/instance/instanceModels.js';

import { configAtom, focusKeyAtom, marksAtom } from '../atoms.js';
import { isContainRect } from '../modules/base/rectUtils.js';
import { isCrxElement } from '../modules/isCrxElement.js';
import { setMarks } from '../modules/setMarks.js';

import './Box.scss';

// 外边框vs内边框, 我们选择外边框
interface Props {
  mark: Instance;
  creator?: boolean;
}

function CreatorBox({ mark }: Props): React.ReactNode {
  const { colors } = useAtomValue(configAtom);
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

  const { backgroundColor, color } = colors[mark.type];
  return (
    <div
      data-key={0}
      className="crx-mark crx-creator"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        backgroundColor,
        color,
      }}
    />
  );
}
export default memo(CreatorBox);
