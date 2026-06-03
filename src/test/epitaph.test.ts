import { describe, it, expect } from "vitest";
import { epitaphFor, CAUSE_LABEL } from "../lib/epitaph";
import { scoreRepo } from "../lib/scoring";
import type { RawRepo } from "../lib/types";

const NOW = Date.UTC(2026, 0, 1);

function graveFrom(overrides: Partial<RawRepo>) {
  const r: RawRepo = {
    id: 1,
    name: "todo-app",
    full_name: "me/todo-app",
    description: null,
    language: "JavaScript",
    html_url: "https://github.com/me/todo-app",
    created_at: new Date(NOW - 900 * 86400000).toISOString(),
    pushed_at: new Date(NOW - 800 * 86400000).toISOString(),
    open_issues_count: 0,
    stargazers_count: 0,
    forks_count: 0,
    size: 300,
    archived: false,
    fork: false,
    topics: [],
    license: null,
    ...overrides,
  };
  return scoreRepo(r, NOW);
}

describe("epitaphFor", () => {
  it("is deterministic for the same grave", () => {
    const g = graveFrom({});
    expect(epitaphFor(g).verse).toBe(epitaphFor(g).verse);
  });

  it("produces a non-empty verse of at most two lines", () => {
    const e = epitaphFor(graveFrom({}));
    expect(e.verse.length).toBeGreaterThan(0);
    expect(e.verse.split("\n").length).toBeLessThanOrEqual(2);
  });

  it("varies across different repos", () => {
    const verses = new Set(
      [1, 2, 3, 4, 5, 6].map((id) => epitaphFor(graveFrom({ id, name: `repo-${id}` })).verse)
    );
    expect(verses.size).toBeGreaterThan(1);
  });

  it("reflects the cause of death", () => {
    const wip = graveFrom({ lastCommitMessage: "wip giving up" });
    expect(wip.causeOfDeath).toBe("honest-wip");
    expect(epitaphFor(wip).cause).toBe(CAUSE_LABEL["honest-wip"]);
  });
});
