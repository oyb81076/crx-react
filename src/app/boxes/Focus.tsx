import { Mark } from '~/models/mark.js';

import Box from '../box/Box.js';

// Nav Hover 在某个item上的时候页面独立显示某个东西
export default function Focus({ mark }: { mark: Mark }): React.ReactNode {
  return <Box mark={mark} active />;
}
