import { useAtomValue } from 'jotai';

import { navBodyAtom, NavBodyType } from '../atoms.js';
import { keyMapConfigs } from '../keymap/keyMapConfig.js';

export default function NavHelp(): React.ReactNode {
  const body = useAtomValue(navBodyAtom);
  return body === NavBodyType.HELP && (
    <ul className="crx-nav-help">
      <Item title="隐藏所有标注" action="按住Alt不放" />
      <Item title="移动位置" action="鼠标拖动标注" />
      <Item title="打开标注面板" action="双击标注" />
      {keyMapConfigs.map((x, i) => (
        <Item key={i} title={x.title} action={x.cmd.join(', ')} />
      ))}
    </ul>
  );
}

function Item({ title, action }: { title: string; action: string }) {
  return (
    <li className="crx-nav-help-item">
      <span style={{ color: 'black' }}>{title}</span>
      <span>{action}</span>
    </li>
  );
}
