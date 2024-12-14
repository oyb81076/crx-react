const map = new WeakMap<HTMLElement, HTMLElement>();

/**
 * 在 background.js 中可以干预？
 * 这个劫持的bug在于没有办法干预 ::after 这种伪类
 * 更好的持久化方式还是通过修改样式表, 增加 --hover 这种属性
 * 持久化节点
 *
 * 将样式持久化 + 移除事件
 */
export function persist(element: HTMLElement) {
  if (element.hasAttribute('x-persist')) return;
  const clone = element.cloneNode(false) as HTMLElement;
  element.replaceWith(clone);
  moveChildren(element, clone);
  const computedStyle = window.getComputedStyle(clone);
  for (const prop of computedStyle) {
    const val = computedStyle.getPropertyValue(prop);
    clone.style.setProperty(prop, val);
  }
  map.set(clone, element);
}
/**
 *
 * 解除持久化
 */
export function release(persisted: HTMLElement) {
  const origin = map.get(persisted);
  if (origin) {
    map.delete(persisted);
    persisted.replaceWith(origin);
    moveChildren(persisted, origin);
  }
}

function moveChildren(from: HTMLElement, to: HTMLElement) {
  to.replaceChildren(...from.childNodes);
}
