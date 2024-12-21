import { CaptureCompleteRequest, CaptureNextRequest, CaptureNextResponse, CaptureStartRequest, GetCaptureRectRequest, GetCaptureRectResponse } from './capture.models.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'capture', title: '截屏' });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab?.id == null) return;
  if (info.menuItemId === 'capture') {
    capture(tab.id).catch(console.error);
  }
});

async function capture(tabId: number) {
  const res = await chrome.tabs.sendMessage<GetCaptureRectRequest, GetCaptureRectResponse>(
    tabId,
    { type: 'get_capture_rect' },
  );
  if (res.rect != null) {
    await captureRect(tabId, res.rect, res.dpr);
  } else {
    await captureFull(tabId, res.dpr);
  }
}

interface Rect {
  x: number;
  w: number;
  h: number;
  y: number;
}
async function captureRect(tabId: number, rect: Rect, dpr: number): Promise<void> {
  const { error } = await chrome.tabs.sendMessage<CaptureStartRequest, { error?: string }>(tabId, {
    type: 'capture_start',
    mode: 'rect',
  });
  if (error) {
    console.error(error);
    return;
  }
  await sleep(200);
  const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
  const img = await createImage(dataUrl);
  const canvas = new OffscreenCanvas(rect.w * dpr, rect.h * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    img,
    rect.x * dpr, rect.y * dpr, rect.w * dpr, rect.h * dpr,
    0, 0, rect.w * dpr, rect.h * dpr,
  );
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  const dataUrl2 = await blobToBase64(blob);
  await chrome.tabs.sendMessage<CaptureCompleteRequest, void>(tabId, {
    type: 'capture_complete',
    dataUrl: dataUrl2,
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    dpr,
  });
}

interface Snapshot {
  dataUrl: string;
  info: CaptureNextResponse;
}
async function captureFull(tabId: number, dpr: number) {
  const screenshots: Snapshot[] = [];
  const { error } = await chrome.tabs.sendMessage<CaptureStartRequest, { error?: string }>(tabId, {
    type: 'capture_start',
    mode: 'full',
  });
  if (error) {
    console.error(error);
    return;
  }
  while (true) {
    const info = await chrome.tabs.sendMessage<CaptureNextRequest, CaptureNextResponse>(tabId, { type: 'capture_next' });
    if (info.error) {
      console.log(info.error);
      return;
    }
    await sleep(350);
    const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
    screenshots.push({ dataUrl, info });
    if (!info.hasNext) break;
  }

  const canvas = await combineScreenshots(screenshots);
  const blob = await canvas.convertToBlob({ type: 'png' });
  const dataUrl = await blobToBase64(blob);
  await chrome.tabs.sendMessage<CaptureCompleteRequest, void>(tabId, {
    type: 'capture_complete', dataUrl,
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height,
    dpr,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// 拼接图片
async function combineScreenshots(
  snaps: Snapshot[],
): Promise<OffscreenCanvas> {
  const lastInfo = snaps.at(-1)!.info;
  const { scale } = lastInfo;
  const clientWidth = (lastInfo.x + lastInfo.width) * scale;
  const clientHeight = (lastInfo.y + lastInfo.height) * scale;
  const canvas = new OffscreenCanvas(clientWidth, clientHeight);
  const context = canvas.getContext('2d');
  for (const { dataUrl, info } of snaps) {
    const img = await createImage(dataUrl);
    context!.drawImage(img, 0, 0, img.width, img.height,
      info.x * scale, info.y * scale, img.width, img.height);
  }
  if (!canvas) throw new Error('未产生任何截屏');
  return canvas;
}
async function createImage(dataUrl: string): Promise<ImageBitmap> {
  const xhr = await fetch(dataUrl);
  const blob = await xhr.blob();
  const bitmap = await createImageBitmap(blob);
  return bitmap;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
