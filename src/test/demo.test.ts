import { describe, it, expect } from "vitest";
import { getDemoRepos } from "../lib/demo";
import { computeWrapped } from "../lib/wrapped";
import { scoreRepo } from "../lib/scoring";

const NOW = Date.UTC(2026, 5, 3);

describe("demo dataset", () => {
  it("produces a juicy graveyard with a couple of survivors", () => {
    const repos = getDemoRepos(NOW);
    const w = computeWrapped(repos, NOW, "octodev");
    expect(w.graves).toBeGreaterThanOrEqual(10);
    expect(w.alive).toBeGreaterThanOrEqual(1);
    expect(w.completionRate).toBeLessThan(0.3);
  });

  it("spans at least four distinct causes of death", () => {
    const repos = getDemoRepos(NOW);
    const causes = new Set(
      repos.map((r) => scoreRepo(r, NOW)).filter((g) => g.isGrave).map((g) => g.causeOfDeath)
    );
    expect(causes.size).toBeGreaterThanOrEqual(4);
  });
});
