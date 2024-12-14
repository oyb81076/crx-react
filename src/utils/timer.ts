// mock 各种函数, 在截屏的时候就禁用掉所有的函数
// 防止banner这些定时器的干扰

export const setTimeout = window.setTimeout;
export const setInterval = window.setInterval;
export const requestAnimationFrame = window.requestAnimationFrame;
export const addEventListener = window.addEventListener;

const disable = new Set<object>();

export function stopAllTimers() {
  const ref = {};
  disable.add(ref);
  return {
    resume: () => {
      disable.delete(ref);
    },
  };
}

Object.assign(window, {
  setTimeout: (handler: (...args: unknown[]) => void, ms: number, ...args: unknown[]) => {
    return setTimeout(() => {
      if (disable.size) return;
      handler(...args);
    }, ms);
  },
  setInterval: (handler: (...args: unknown[]) => void, ms: number, ...args: unknown[]) => {
    return setInterval(() => {
      if (disable.size) return;
      handler(...args);
    }, ms);
  },
  requestAnimationFrame: (cb: (e: number) => void) => {
    return requestAnimationFrame((e) => {
      if (disable.size) return;
      cb(e);
    });
  },
});
