// 事件系统用来给react脱敏

interface Events {
  set_capture_rect: [rect: { x: number; y: number; w: number; h: number } | null];
  capture_complete: [result: { dataUrl: string; x: number; y: number; w: number; h: number; dpr: number }];
  capture_start: [];
}

export const captureEvents = {
  emit<K extends keyof Events>(key: K, ...args: Events[K]) {
    window.postMessage({ type: key, args }, window.location.origin);
  },
  subscribe<K extends keyof Events>(key: K, callback: (...args: Events[K]) => void) {
    const handle = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data.type !== key) return;
      callback(...e.data.args);
    };
    window.addEventListener('message', handle);
    return () => {
      window.removeEventListener('message', handle);
    };
  },
};
