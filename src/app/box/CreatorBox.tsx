import { memo } from 'react';
import clsx from 'clsx';

import { Mark } from '~/models/mark.js';

import markName from '../modules/markName.js';
import { isMarkOutside, isMarkRight } from './boxUtils.js';

import './Box.scss';

// 外边框vs内边框, 我们选择外边框
interface Props {
  mark: Mark;
  creator?: boolean;
}

function CreatorBox({ mark }: Props): React.ReactNode {
  const rect = mark.rect;
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
