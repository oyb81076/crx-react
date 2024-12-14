const map = new WeakMap<HTMLElement, string>();

/**
 * 禁用鼠标事件, 只会禁用mouse事件
 */
export function disableMouseEvent(target: HTMLElement) {
  if (map.has(target)) return;
  const origin = target.style.pointerEvents;
  map.set(target, origin);
  target.style.pointerEvents = 'none';
}
/**
 * 禁用事件, 只会禁用mouse事件
 * @deprecated
 */
export function enableListeners(target: HTMLElement) {
  if (!map.has(target)) return;
  target.style.pointerEvents = map.get(target) || '';
  map.delete(target);
}
