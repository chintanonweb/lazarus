import { describe, it, expect } from "vitest";
import { computeWrapped } from "../lib/wrapped";
import type { RawRepo } from "../lib/types";

const NOW = Date.UTC(2026, 0, 1);

function repo(o: Partial<RawRepo>): RawRepo {
  return {
    id: Math.random(),
    name: "r",
    full_name: "me/r",
    description: null,
    language: "TypeScript",
    html_url: "",
    created_at: new Date(NOW - 1000 * 86400000).toISOString(),
    pushed_at: new Date(NOW - 700 * 86400000).toISOString(),
    open_issues_count: 0,
    stargazers_count: 0,
    forks_count: 0,
    size: 100,
    archived: false,
    fork: false,
    topics: [],
    license: null,
    ...o,
  };
}

describe("computeWrapped", () => {
  it("counts graves, alive, and completion rate (forks excluded)", () => {
    const repos = [
      repo({ name: "dead-1", pushed_at: new Date(NOW - 700 * 86400000).toISOString() }),
      repo({ name: "dead-2", pushed_at: new Date(NOW - 900 * 86400000).toISOString() }),
      repo({ name: "alive", pushed_at: new Date(NOW - 10 * 86400000).toISOString() }),
      repo({ name: "a-fork", fork: true }),
    ];
    const w = computeWrapped(repos, NOW, "me");

    expect(w.totalRepos).toBe(3); // fork excluded
    expect(w.graves).toBe(2);
    expect(w.alive).toBe(1);
    expect(w.completionRate).toBeCloseTo(1 / 3, 5);
    expect(w.oldestGraveName).toBe("dead-2"); // 900 days cold
    expect(w.longestColdDays).toBe(900);
    expect(w.deadWeightKB).toBe(200);
    expect(w.username).toBe("me");
  });

  it("returns nulls and zeros for an empty graveyard", () => {
    const w = computeWrapped([], NOW);
    expect(w.graves).toBe(0);
    expect(w.topCause).toBeNull();
    expect(w.topBuriedLanguage).toBeNull();
    expect(w.completionRate).toBe(0);
  });
});
