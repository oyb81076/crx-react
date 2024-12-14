export function isCrxElement(e: EventTarget | null) {
  if (e == null) return false;
  if (e instanceof HTMLElement) return e.closest('#crx-root') != null;
  return false;
}
