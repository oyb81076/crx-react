// rgba(0 0 0 / 0%)
const MORDERN_RGBA = /^rgba?\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+%?)\)$/;
const CLASSIC_RGBA = /^rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/;

export default function isTransparentColor(color: string) {
  color = color.toLocaleLowerCase();
  // 检查是否是 `transparent` 关键字
  if (color === 'transparent') {
    return true;
  }

  // 匹配现代 CSS 的 rgba 语法（支持 `/` 分隔透明度）
  const modernRgbaMatch = color.match(MORDERN_RGBA);
  if (modernRgbaMatch) {
    let alpha: string | number = modernRgbaMatch[4];
    // 如果透明度是百分比，转换为小数
    if (alpha.endsWith('%')) {
      alpha = parseFloat(alpha) / 100;
    } else {
      alpha = parseFloat(alpha);
    }
    return alpha === 0; // 检查透明度是否为 0
  }

  // 匹配传统 CSS 的 rgba 语法（用逗号分隔）
  const classicRgbaMatch = color.match(CLASSIC_RGBA);
  if (classicRgbaMatch) {
    const alpha = parseFloat(classicRgbaMatch[4]);
    return alpha === 0; // 检查透明度是否为 0
  }
  // 如果既不是现代语法也不是传统语法，则默认认为不是透明
  return false;
}
