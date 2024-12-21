/* eslint-disable @typescript-eslint/no-explicit-any */

export default class EventBus<E extends { [key in keyof E]: any[] }> {
  private listeners = new Map<keyof E, Map<() => void, (...args: any[]) => void>>();

  public subscribe<K extends keyof E>(key: K, callback: (...args: E[K]) => void) {
    let map = this.listeners.get(key);
    if (map == null) this.listeners.set(key, map = new Map());
    const unsubscribe = () => { this.listeners.get(key)?.delete(unsubscribe); };
    map.set(unsubscribe, callback);
    return unsubscribe;
  }

  public emit<K extends keyof E>(key: K, ...args: E[K]) {
    this.listeners.get(key)?.values().forEach((cb) => cb(...args));
  }
}
