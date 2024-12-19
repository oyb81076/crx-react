export interface MarkConfig<T extends MarkBase & { type: number | string | symbol }> {
  type: string;
  parse: (element: HTMLElement) => T[];
  titles: Record<T['type'], string>;
  colors: Record<T['type'], {
    backgroundColor: string;
    borderColor: string;
    color: string;
  }>;
  nextType: (prev: T) => T;
}

export interface MarkBase {
  key: number;
  rect: MarkRect;
}

export interface MarkRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
