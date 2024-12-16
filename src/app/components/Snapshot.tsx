import { useState } from 'react';

interface Props {
  base64: string;
}
// 页面截屏后显示页面快照的
export default function Snapshot({ base64 }: Props): React.ReactNode {
  const [wh, setWh] = useState<[w: number, h: number] | null>(null);
  return (
    <div style={{ width: 400 }}>
      {wh && <div>{wh[0]} x {wh[1]}</div>}
      {base64 && (
        <>
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            <img
              style={{ maxWidth: 400 }}
              src={'data:image/png;base64,' + base64}
              onLoad={(e) => setWh([e.currentTarget.naturalWidth, e.currentTarget.naturalHeight])}
            />
          </div>
          <div>
            <a href={'data:image/png;base64,' + base64} download="screenshot.png">下载</a>
          </div>
        </>
      )}
    </div>
  );
}
