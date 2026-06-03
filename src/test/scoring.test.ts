import { describe, it, expect } from "vitest";
import { scoreRepo, daysBetween, ABANDON_THRESHOLD_DAYS } from "../lib/scoring";
import type { RawRepo } from "../lib/types";

const NOW = Date.UTC(2026, 0, 1); // 2026-01-01

function repo(overrides: Partial<RawRepo>): RawRepo {
  return {
    id: 1,
    name: "thing",
    full_name: "me/thing",
    description: "a thing",
    language: "TypeScript",
    html_url: "https://github.com/me/thing",
    created_at: new Date(NOW - 500 * 86400000).toISOString(),
    pushed_at: new Date(NOW - 400 * 86400000).toISOString(),
    open_issues_count: 0,
    stargazers_count: 0,
    forks_count: 0,
    size: 500,
    archived: false,
    fork: false,
    topics: ["x"],
    license: "mit",
    ...overrides,
  };
}

describe("daysBetween", () => {
  it("counts whole days", () => {
    expect(daysBetween(NOW - 400 * 86400000, NOW)).toBe(400);
  });
});

describe("scoreRepo", () => {
  it("marks a stale, owned, non-empty repo as a grave", () => {
    const g = scoreRepo(repo({}), NOW);
    expect(g.isGrave).toBe(true);
    expect(g.daysCold).toBe(400);
    expect(g.ageDays).toBe(100);
    expect(g.abandonmentScore).toBeGreaterThanOrEqual(0);
    expect(g.abandonmentScore).toBeLessThanOrEqual(100);
  });

  it("does not bury archived repos or forks", () => {
    expect(scoreRepo(repo({ archived: true }), NOW).isGrave).toBe(false);
    expect(scoreRepo(repo({ fork: true }), NOW).isGrave).toBe(false);
  });

  it("does not bury fresh repos under the threshold", () => {
    const fresh = repo({ pushed_at: new Date(NOW - 10 * 86400000).toISOString() });
    expect(scoreRepo(fresh, NOW).isGrave).toBe(false);
    expect(ABANDON_THRESHOLD_DAYS).toBe(180);
  });

  it("calls many open issues on a big repo scope-creep", () => {
    const r = repo({ open_issues_count: 12, size: 5000 });
    expect(scoreRepo(r, NOW).causeOfDeath).toBe("scope-creep");
  });

  it("calls a repo touched only briefly after birth lost-interest", () => {
    const created = NOW - 420 * 86400000;
    const r = repo({
      created_at: new Date(created).toISOString(),
      pushed_at: new Date(created + 20 * 86400000).toISOString(),
      open_issues_count: 0,
      size: 100,
    });
    expect(scoreRepo(r, NOW).causeOfDeath).toBe("lost-interest");
  });

  it("respects an honest WIP commit message", () => {
    const r = repo({ lastCommitMessage: "wip, giving up for tonight" });
    expect(scoreRepo(r, NOW).causeOfDeath).toBe("honest-wip");
  });
});
