import { memo } from 'react';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';

import { Instance } from '~/app/modules/instance/instanceModels.js';

import { configAtom } from '../atoms.js';

import './Box.scss';

interface Props {
  mark: Instance;
  active?: boolean;
}

// 普通非激活状态的节点
function Box({ mark, active }: Props): React.ReactNode {
  const { y: top, x: left, w: width, h: height } = mark.rect;
  const config = useAtomValue(configAtom);
  const { backgroundColor, color } = config.colors[mark.type];
  return (
    <div
      data-key={mark.key}
      className={clsx('crx-mark', active && 'crx-active')}
      style={{ top, left, width, height, color, backgroundColor }}
    >
      {active && config.titles[mark.type] + mark.key}
    </div>
  );
}
export default memo(Box);
