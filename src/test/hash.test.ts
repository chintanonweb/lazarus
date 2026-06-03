import { describe, it, expect } from "vitest";
import { hashString, seededRandom, pick } from "../lib/hash";

describe("hashString", () => {
  it("is a stable, positive integer for the same input", () => {
    const a = hashString("abc");
    const b = hashString("abc");
    expect(a).toBe(b);
    expect(Number.isInteger(a)).toBe(true);
    expect(a).toBeGreaterThan(0);
  });

  it("differs for different inputs", () => {
    expect(hashString("abc")).not.toBe(hashString("abd"));
  });
});

describe("seededRandom", () => {
  it("is deterministic for a given seed", () => {
    const r1 = seededRandom(42);
    const r2 = seededRandom(42);
    const seq1 = [r1(), r1(), r1()];
    const seq2 = [r2(), r2(), r2()];
    expect(seq1).toEqual(seq2);
    for (const n of seq1) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("produces different sequences for different seeds", () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });
});

describe("pick", () => {
  it("selects deterministically from an array", () => {
    const arr = ["a", "b", "c", "d"];
    const rnd = seededRandom(7);
    const first = pick(arr, rnd);
    expect(arr).toContain(first);
  });
});
