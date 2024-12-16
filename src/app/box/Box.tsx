import { memo } from 'react';
import clsx from 'clsx';

import { Mark } from '~/models/mark.js';

import markName from '../modules/markName.js';

import './Box.scss';

// 外边框vs内边框, 我们选择外边框
interface Props {
  mark: Mark;
  active?: boolean;
}

function Box({ mark, active }: Props): React.ReactNode {
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

  const isTagLeft = left < document.documentElement.clientWidth - 50;
  return (
    <>
      <div
        className={clsx('crx-box-tag', active && 'crx-active')}
        style={{
          top: top < 20 ? 0 : top - 14 + border,
          left: isTagLeft ? left : undefined,
          right: isTagLeft ? undefined : left + width,
        }}
      >
        {markName(mark)}:{mark.key === 0 ? '新增' : mark.key}
      </div>
      <div
        // border top
        className={clsx('crx-box-border', active && 'crx-active')}
        style={{ left, top, width, height: border }}
      />
      <div
        // border bottom
        className={clsx('crx-box-border', active && 'crx-active')}
        style={{ left, top: top + height - border, width, height: border }}
      />
      <div
        // border left
        className={clsx('crx-box-border', active && 'crx-active')}
        style={{ left, top, height, width: border }}
      />
      <div
        // border right
        className={clsx('crx-box-border', active && 'crx-active')}
        style={{ left: left + width - border, top, height, width: border }}
      />
    </>
  );
}
export default memo(Box);
