import type { SyncStorage } from 'jotai/vanilla/utils/atomWithStorage';

const JSON_SESSION_STORAGE: SyncStorage<unknown> = {
  getItem: (key, initialValue) => {
    const item = sessionStorage.getItem(key);
    if (!item || item === 'null') return initialValue;
    try {
      return JSON.parse(item);
    } catch (err) {
      console.error(err);
      return initialValue;
    }
  },
  setItem: (key, value) => {
    if (value == null) localStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (key) => {
    sessionStorage.removeItem(key);
  },
  subscribe(key, callback) {
    const handle = (e: StorageEvent) => {
      if (e.storageArea !== sessionStorage) return;
      if (e.key !== key) return;
      try {
        if (e.newValue) callback(JSON.parse(e.newValue));
      } catch {
        //
      }
    };
    window.addEventListener('storage', handle);
    return () => {
      window.removeEventListener('storage', handle);
    };
  },
};

export function createSessionStorage<T>(): SyncStorage<T> {
  return JSON_SESSION_STORAGE as SyncStorage<T>;
}
