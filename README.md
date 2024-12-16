# install

pnpm install

## 开发

pnpm dev
修改之后调试需要在 chrome 中刷新

## 打包

pnpm build

# 标注原则

尽可能少做标注
div + 文字 只要不是 div 有什么特殊背景色, 只标注文本就可以了

网格布局还是纵向还是横向, 是 ai 推测还是人为操作

后续会根据 box 推测层级关系, 有了层级关系后可以快速推测出布局形式(absolute, flex, grid, 横向, 纵向)
存在 box 也容易推测出布局形式和对其形式
