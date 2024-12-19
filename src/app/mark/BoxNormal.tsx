import { memo } from 'react';
import { useAtomValue } from 'jotai';

import { Instance } from '~/app/modules/instance/instanceModels.js';

import { configAtom } from '../atoms.js';

import './Box.scss';

interface Props {
  mark: Instance;
}

// 普通非激活状态的节点
function Box({ mark }: Props): React.ReactNode {
  const { top, left, width, height } = mark.rect;
  const config = useAtomValue(configAtom);
  const { backgroundColor } = config.colors[mark.type];
  return (
    <div className="crx-mark" style={{ top, left, width, height, backgroundColor }} />
  );
}
export default memo(Box);
