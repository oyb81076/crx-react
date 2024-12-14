import sleep from '../utils/sleep.js';
import { stopAllTimers } from '../utils/timer.js';
import { CaptrueRequest, CaptureCompleteRequest, CaptureNextResponse, CaptureStartRequest } from './captureModels.js';
import { getAllFixedElements } from './captureUtils.js';
// 游览器代码

interface Context {
  index: number;
  js: { resume: () => void };
  origin: {
    // body 上原本的 pointerEvents 事件
    pointerEvents: string;
    // 原本的 滚动条位置
    scrollY: number;
  };
  // position: fixed; 元素
  fixes: { el: HTMLElement; display: string; bottom: boolean }[];
  clientHeight: number; // 游览器可视区域的高度
  totalWidth: number; // 游览器高度
  totalHeight: number;// 可用高度
}
let context: Context | null;

function init() {
  context = {
    index: 0,
    js: stopAllTimers(),
    origin: {
      pointerEvents: document.body.style.pointerEvents,
      scrollY: window.scrollY,
    },
    fixes: getAllFixedElements(),
    clientHeight: document.documentElement.clientHeight,
    totalWidth: document.documentElement.clientWidth,
    totalHeight: document.documentElement.scrollHeight,
  };
  // 禁用所有鼠标事件
  document.body.style.pointerEvents = 'none';
}
// 恢复原来的样子
function resume() {
  if (context === null) return;
  context.js.resume();
  console.log(context);
  document.body.style.pointerEvents = context.origin.pointerEvents;
  context.fixes.forEach((x) => x.el.style.display = x.display);
  window.scrollTo(0, context.origin.scrollY);
  context = null;
}

chrome.runtime.onMessage.addListener((req: CaptrueRequest, _, sendResponse) => {
  const action = actions[req.type as 'capture_start'];
  if (!action) return;
  action(req as CaptureStartRequest)
    .then((res) => res ?? {})
    .catch((err: Error) => {
      console.log(err);
      resume();
      return { error: err.message };
    })
    .then((res) => {
      console.log(req, res);
      sendResponse(res);
    });
  return true;
});

async function onCaptureComplete(req: CaptureCompleteRequest): Promise<void> {
  resume();
  const link = document.createElement('a');
  link.href = req.payload;
  link.download = 'full_page_screenshot.png';
  link.click();
}

const actions: {
  [Type in CaptrueRequest['type']]: (req: Extract<CaptrueRequest, { type: Type }>) => Promise<unknown>
} = {
  capture_start: onCaptureStart,
  capture_next: onCaptureNext,
  capture_complete: onCaptureComplete,
};

async function onCaptureStart(): Promise<void> {
  if (context != null) throw new Error('正在截屏中无法响应');
  init();
}

async function onCaptureNext(): Promise<CaptureNextResponse> {
  if (context == null) throw new Error('截屏状态异常');
  if (context.clientHeight !== document.documentElement.clientHeight) throw new Error('页面高度发生了变化');
  if (context.totalWidth !== document.documentElement.clientWidth) throw new Error('页面宽度发生了变化');
  if (context.clientHeight >= context.totalHeight) { // 无滚动条
    window.scrollTo(0, 0);
    await sleep(100);
    return {
      hasNext: false, scale: window.devicePixelRatio,
      x: 0, y: 0, width: context.totalWidth, height: context.totalHeight,
    };
  } else if (context.index === 0) {
    window.scrollTo(0, 0);
    await sleep(100);
    // 隐藏fix bottom 元素
    context.fixes
      .filter((x) => x.bottom)
      .forEach((x) => x.el.style.display = 'none');
    context.index = 1;
    return {
      hasNext: true, scale: window.devicePixelRatio,
      x: 0, y: window.scrollY,
      width: context.totalWidth,
      height: context.clientHeight,
    };
  } else {
    if (context.index === 1) {
      context.fixes
        .filter((x) => !x.bottom)
        .forEach((x) => x.el.style.display = 'none');
    }
    window.scrollTo(0, window.scrollY + context.clientHeight);
    await sleep(100);
    const hasNext = window.scrollY + context.clientHeight < context.totalHeight;
    if (!hasNext) { // 当到达底部的时候, 把底部fixed元素都展示出来
      context.fixes.filter((x) => x.bottom)
        .forEach((x) => x.el.style.display = x.display);
    }
    context.index += 1;
    return {
      hasNext,
      scale: window.devicePixelRatio,
      x: 0,
      y: window.scrollY,
      width: context.totalWidth,
      height: context.clientHeight,
    };
  }
}
