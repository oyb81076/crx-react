import { setTimeout } from './timer.js';

export default function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
