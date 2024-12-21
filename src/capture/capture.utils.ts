interface FixElement {
  el: HTMLElement;
  display: string;
  bottom: boolean;
}

export function getAllFixedElements(): FixElement[] {
  const allElements = document.body.querySelectorAll<HTMLElement>('*');
  const out: FixElement[] = [];
  allElements.forEach((el) => {
    const style = getComputedStyle(el);
    if (style.position !== 'fixed') return;
    if (style.display === 'none') return;
    if (style.visibility === 'hidden') return;
    if (style.opacity === '0') return;
    out.push({ el, display: style.display, bottom: isNearbyBottom(el) });
  });
  return out;
}

function isNearbyBottom(el: Element) {
  const rect = el.getBoundingClientRect();
  const bottom = window.innerHeight - rect.bottom;
  return bottom < window.innerHeight / 4;
}
