/** Deterministic linear congruential generator. Same seed → same demo. */
export class Rng {
  private state: number;

  constructor(seed = 20260909) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return this.state;
  }

  float(): number {
    return this.next() / 0x100000000;
  }

  int(min: number, max: number): number {
    return min + Math.floor(this.float() * (max - min + 1));
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("Rng.pick called with an empty list");
    }
    const item = items[this.int(0, items.length - 1)];
    if (item === undefined) {
      throw new Error("Rng.pick index out of range");
    }
    return item;
  }

  pickN<T>(items: readonly T[], n: number): T[] {
    const copy = [...items];
    const out: T[] = [];
    while (out.length < n && copy.length > 0) {
      const index = this.int(0, copy.length - 1);
      const [chosen] = copy.splice(index, 1);
      if (chosen !== undefined) out.push(chosen);
    }
    return out;
  }

  chance(p: number): boolean {
    return this.float() < p;
  }

  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      const a = copy[i];
      const b = copy[j];
      if (a === undefined || b === undefined) continue;
      copy[i] = b;
      copy[j] = a;
    }
    return copy;
  }
}
