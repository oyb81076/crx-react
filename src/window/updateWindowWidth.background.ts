export async function updateWidthWidth(width: number) {
  const w = await chrome.windows.getCurrent();
  if (w.id == null) return;
  await chrome.windows.update(w.id, { width });
}
