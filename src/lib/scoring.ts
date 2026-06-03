import type { CauseOfDeath, Grave, RawRepo } from "./types";

const DAY = 86400000;
export const ABANDON_THRESHOLD_DAYS = 180;

/** Whole days between two instants (ISO strings or epoch ms). */
export function daysBetween(a: string | number, b: string | number): number {
  const t1 = typeof a === "number" ? a : new Date(a).getTime();
  const t2 = typeof b === "number" ? b : new Date(b).getTime();
  return Math.floor((t2 - t1) / DAY);
}

/**
 * Score a single repo. `now` is injected (never Date.now() here) so the
 * function is pure and tests are deterministic.
 */
export function scoreRepo(repo: RawRepo, now: number): Grave {
  const pushed = new Date(repo.pushed_at).getTime();
  const created = new Date(repo.created_at).getTime();
  const daysCold = Math.max(0, Math.floor((now - pushed) / DAY));
  const ageDays = Math.max(0, Math.floor((pushed - created) / DAY));

  const isGrave =
    !repo.archived && !repo.fork && repo.size > 0 && daysCold > ABANDON_THRESHOLD_DAYS;

  // Incompleteness: missing description / license / topics (0..3).
  const missing =
    (repo.description ? 0 : 1) +
    (repo.license ? 0 : 1) +
    (repo.topics && repo.topics.length ? 0 : 1);

  const staleness = Math.min(60, (daysCold / 1500) * 60); // 0..60
  const incompleteness = (missing / 3) * 25; // 0..25
  const hanging = Math.min(15, repo.open_issues_count * 1.5); // 0..15
  const abandonmentScore = Math.round(Math.min(100, staleness + incompleteness + hanging));

  return {
    repo,
    isGrave,
    daysCold,
    ageDays,
    bornYear: new Date(repo.created_at).getUTCFullYear(),
    diedYear: new Date(repo.pushed_at).getUTCFullYear(),
    abandonmentScore,
    causeOfDeath: deriveCause(repo, daysCold, ageDays),
  };
}

function deriveCause(repo: RawRepo, daysCold: number, ageDays: number): CauseOfDeath {
  const msg = (repo.lastCommitMessage || "").toLowerCase();
  if (/wip|fix later|todo|temp\b|tmp|giving up|broken|hack/.test(msg)) return "honest-wip";
  if (repo.open_issues_count >= 5 && repo.size > 2000) return "scope-creep";
  if (ageDays <= 7) return "shiny-new-thing";
  if (ageDays <= 30) return "lost-interest";
  if (repo.stargazers_count >= 10 && daysCold > 365) return "good-enough";
  if (daysCold > 730) return "ghosted";
  return "ran-out-of-weekend";
}
