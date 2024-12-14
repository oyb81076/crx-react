/**
 * 不要随便用, 这里我暂时放在这里当作废代码, 说不定之后有用,
 * 这里的几种方式,
 * 第一个就是在document中注入, capture 事件, 然后根据需要 preventDefault + stopProptation
 * 第二种是劫持 addEventListener
 */

/**
 * 禁用事件, 只会禁用mouse事件
 * @deprecated
 */
export function disableListeners(target: HTMLElement) {
  disableOne(target);
  target.querySelectorAll<HTMLElement>('*').forEach(disableOne);
}
/**
 * 禁用事件, 只会禁用mouse事件
 * @deprecated
 */
export function enableListeners(target: HTMLElement) {
  enableOne(target);
  target.querySelectorAll<HTMLElement>('*').forEach(enableOne);
}

// 存储所有注册的事件监听器
interface Listener {
  type: string;
  listener: EventListenerOrEventListenerObject;
  opts: AddEventListenerOptions;
  enable: boolean;
}
const eventListeners = new WeakMap<EventTarget, Listener[]>();

const originalAddEventListener = EventTarget.prototype.addEventListener;
const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

// 重写 addEventListener
EventTarget.prototype.addEventListener = function (type, listener, options) {
  if (listener) {
    const opts: AddEventListenerOptions = typeof options === 'boolean'
      ? { capture: options }
      : { capture: false, ...options };
    if (!opts.once) {
      let listeners = eventListeners.get(this);
      if (listeners == null) eventListeners.set(this, listeners = []);
      listeners.push({ type, listener, opts, enable: true });
    }
  }
  // 调用原生 addEventListener
  originalAddEventListener.call(this, type, listener, options);
};

// 重写 removeEventListener
EventTarget.prototype.removeEventListener = function (type, listener, options) {
  const opts: AddEventListenerOptions = typeof options === 'boolean'
    ? { capture: options }
    : { capture: false, ...options };
  if (!opts.once) {
    const listeners = eventListeners.get(this);
    if (listeners) {
      const next = listeners.filter((x) => x.type !== type || x.listener !== listener || x.opts.capture !== opts.capture);
      if (next.length) eventListeners.set(this, next);
      else eventListeners.delete(this);
    }
  }
  // 调用原生 removeEventListener
  originalRemoveEventListener.call(this, type, listener, options);
};

function disableOne(el: EventTarget) {
  eventListeners.get(el)?.filter((x) => x.enable).forEach((obj) => {
    obj.enable = false;
    originalRemoveEventListener.call(el, obj.type, obj.listener, obj.opts);
  });
}

function enableOne(el: EventTarget) {
  eventListeners.get(el)?.filter((x) => !x.enable).forEach((obj) => {
    obj.enable = true;
    originalAddEventListener.call(el, obj.type, obj.listener, obj.opts);
  });
}
