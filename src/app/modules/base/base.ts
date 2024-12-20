export interface MarkConfig<T extends MarkBase & { type: number }> {
  type: string;
  parse: (element: HTMLElement) => T[];
  titles: Record<T['type'], string>;
  colors: Record<T['type'], {
    backgroundColor: string;
    borderColor: string;
    color: string;
  }>;
  types: T['type'][];
  nextType: (prev: T) => T;
}

export interface MarkBase {
  key: number;
  rect: MarkRect;
}

export interface MarkRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
