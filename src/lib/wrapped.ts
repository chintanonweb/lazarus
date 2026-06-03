import type { CauseOfDeath, RawRepo, WrappedStats } from "./types";
import { scoreRepo } from "./scoring";

function mode<T extends string>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  for (const i of items) counts.set(i, (counts.get(i) ?? 0) + 1);
  let best: T | null = null;
  let bestN = -1;
  for (const [k, n] of counts) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return best;
}

/**
 * Aggregate a user's repos into the "Abandoned Projects Wrapped" stats.
 * Forks are excluded from the denominator. `now` is injected for determinism.
 */
export function computeWrapped(repos: RawRepo[], now: number, username = ""): WrappedStats {
  const scored = repos.filter((r) => !r.fork).map((r) => scoreRepo(r, now));
  const graves = scored.filter((s) => s.isGrave);
  const totalRepos = scored.length;
  const alive = totalRepos - graves.length;

  let oldestGraveName: string | null = null;
  let longestColdDays = 0;
  for (const g of graves) {
    if (g.daysCold > longestColdDays) {
      longestColdDays = g.daysCold;
      oldestGraveName = g.repo.name;
    }
  }

  const topCause = mode(graves.map((g) => g.causeOfDeath)) as CauseOfDeath | null;
  const topBuriedLanguage = mode(
    graves.map((g) => g.repo.language).filter((l): l is string => !!l)
  );
  const deadWeightKB = graves.reduce((sum, g) => sum + g.repo.size, 0);

  return {
    username,
    totalRepos,
    graves: graves.length,
    alive,
    completionRate: totalRepos ? alive / totalRepos : 0,
    oldestGraveName,
    longestColdDays,
    topCause,
    topBuriedLanguage,
    deadWeightKB,
  };
}
