import { useCallback, useEffect, useState } from 'react';

import './popup.scss';

export default function Popup() {
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null);
  const [err, setErr] = useState<Error | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [wh, setWh] = useState<[w: number, h: number] | null>(null);
  const onCapture = useCallback(() => {
    if (tab?.id == null) return;
    chrome.runtime.sendMessage<object, { screenshot: string; error: string }>(
      { type: 'captureFullPage', tabId: tab.id },
    ).then(({ screenshot, error }) => {
      if (error) setErr(new Error(error));
      setBase64(screenshot);
    }).catch(setErr);
  }, [tab]);
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length === 0) return;
      setTab(tabs[0]);
    }, setErr);
  }, []);
  return (
    <div style={{ width: 800 }}>
      <h1>AI web 标注工具</h1>
      {tab && (
        <div>
          <div>title: {tab.title}</div>
          <div>url: {tab.url}</div>
        </div>
      )}
      {err && <pre>{err.stack}</pre>}
      {wh && <div>{wh[0]} x {wh[1]}</div>}
      {base64 && (
        <>
          <div style={{ width: 800, height: 800, overflow: 'scroll' }}>
            <img
              style={{ maxWidth: 800 }}
              src={'data:image/png;base64,' + base64}
              onLoad={(e) => setWh([e.currentTarget.naturalWidth, e.currentTarget.naturalHeight])}
            />
          </div>
          <div>
            <a href={'data:image/png;base64,' + base64} download="screenshot.png">下载</a>
          </div>
        </>
      )}
      <div>
        <button onClick={onCapture}>截屏</button>
      </div>
    </div>
  );
}
