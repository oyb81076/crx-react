import { Mark, MarkTypeNames } from '~/models/mark.js';

export default function markName(mark: Mark) {
  return MarkTypeNames[mark.type];
}
