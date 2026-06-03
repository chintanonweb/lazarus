import { describe, it, expect } from "vitest";
import { buildRevivalPlan } from "../lib/revival";
import { scoreRepo } from "../lib/scoring";
import type { RawRepo, RepoSignals } from "../lib/types";

const NOW = Date.UTC(2026, 0, 1);

function grave(daysCold: number, lang = "TypeScript") {
  const r: RawRepo = {
    id: 1,
    name: "side-quest",
    full_name: "me/side-quest",
    description: "a half-built CLI",
    language: lang,
    html_url: "",
    created_at: new Date(NOW - (daysCold + 100) * 86400000).toISOString(),
    pushed_at: new Date(NOW - daysCold * 86400000).toISOString(),
    open_issues_count: 3,
    stargazers_count: 0,
    forks_count: 0,
    size: 400,
    archived: false,
    fork: false,
    topics: [],
    license: null,
  };
  return scoreRepo(r, NOW);
}

const bareSignals: RepoSignals = {
  hasReadme: false,
  hasTests: false,
  hasCI: false,
  hasLicense: false,
  openIssues: 3,
  lastCommitMessage: null,
};

describe("buildRevivalPlan", () => {
  it("diagnoses missing pieces and emits a matching Copilot prompt", () => {
    const plan = buildRevivalPlan(grave(400), bareSignals);
    expect(plan.diagnosis.some((d) => /README/i.test(d))).toBe(true);
    expect(plan.prompts.some((p) => /README/i.test(p))).toBe(true);
    expect(plan.prompts.some((p) => /open issues/i.test(p))).toBe(true);
  });

  it("orders the checklist by priority (re-read first)", () => {
    const plan = buildRevivalPlan(grave(400), bareSignals);
    const priorities = plan.checklist.map((c) => c.priority);
    const sorted = [...priorities].sort((a, b) => a - b);
    expect(priorities).toEqual(sorted);
    expect(plan.checklist[0].task).toMatch(/re-read/i);
  });

  it("rates an ancient, gap-ridden grave the hardest to revive", () => {
    expect(buildRevivalPlan(grave(900), bareSignals).difficulty).toBe("ancient-burial");
  });

  it("renders copilot instructions mentioning the language", () => {
    const plan = buildRevivalPlan(grave(400, "Rust"), bareSignals);
    expect(plan.copilotInstructions.length).toBeGreaterThan(50);
    expect(plan.copilotInstructions).toMatch(/Rust/);
  });

  it("is gentle when the repo is actually in good shape", () => {
    const healthy: RepoSignals = {
      hasReadme: true,
      hasTests: true,
      hasCI: true,
      hasLicense: true,
      openIssues: 0,
      lastCommitMessage: null,
    };
    const plan = buildRevivalPlan(grave(200), healthy);
    expect(plan.difficulty).toBe("shallow-grave");
    expect(plan.diagnosis.join(" ")).toMatch(/decent shape/i);
  });
});
