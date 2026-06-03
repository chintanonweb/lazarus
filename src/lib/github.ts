import type { RawRepo, RepoSignals } from "./types";

const API = "https://api.github.com";
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export class GitHubError extends Error {
  constructor(
    message: string,
    public kind: "not-found" | "rate-limit" | "network" | "unknown"
  ) {
    super(message);
  }
}

function headers(token?: string): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function handle(res: Response): Promise<Response> {
  if (res.ok) return res;
  if (res.status === 404) throw new GitHubError("That user doesn't exist on GitHub.", "not-found");
  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    throw new GitHubError(
      "GitHub's rate limit is exhausted. Add a personal access token to keep digging.",
      "rate-limit"
    );
  }
  throw new GitHubError(`GitHub responded with ${res.status}.`, "unknown");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRepo(r: any): RawRepo {
  return {
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description,
    language: r.language,
    html_url: r.html_url,
    created_at: r.created_at,
    pushed_at: r.pushed_at || r.updated_at,
    open_issues_count: r.open_issues_count ?? 0,
    stargazers_count: r.stargazers_count ?? 0,
    forks_count: r.forks_count ?? 0,
    size: r.size ?? 0,
    archived: !!r.archived,
    fork: !!r.fork,
    topics: r.topics ?? [],
    license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
  };
}

function cacheKey(username: string) {
  return `lazarus:repos:${username.toLowerCase()}`;
}

function readCache(username: string): RawRepo[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(username));
    if (!raw) return null;
    const { ts, repos } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return repos;
  } catch {
    return null;
  }
}

function writeCache(username: string, repos: RawRepo[]) {
  try {
    localStorage.setItem(cacheKey(username), JSON.stringify({ ts: Date.now(), repos }));
  } catch {
    /* localStorage may be full or disabled; ignore */
  }
}

/** Fetch a user's (non-fork-filtered) repos, paginated, with a localStorage cache. */
export async function fetchUserRepos(
  username: string,
  token?: string,
  force = false
): Promise<RawRepo[]> {
  const clean = username.trim().replace(/^@/, "");
  if (!clean) throw new GitHubError("Enter a GitHub username first.", "unknown");

  if (!force) {
    const cached = readCache(clean);
    if (cached) return cached;
  }

  const all: RawRepo[] = [];
  for (let page = 1; page <= 4; page++) {
    let res: Response;
    try {
      res = await fetch(
        `${API}/users/${encodeURIComponent(clean)}/repos?per_page=100&sort=pushed&page=${page}`,
        { headers: headers(token) }
      );
    } catch {
      throw new GitHubError("Couldn't reach GitHub. Check your connection.", "network");
    }
    await handle(res);
    const batch = (await res.json()) as any[];
    all.push(...batch.map(mapRepo));
    if (batch.length < 100) break;
  }

  writeCache(clean, all);
  return all;
}

/** Lazily fetch health signals for a single repo (only when its grave is opened). */
export async function fetchRepoSignals(
  owner: string,
  repo: string,
  openIssues: number,
  token?: string
): Promise<RepoSignals> {
  const signals: RepoSignals = {
    hasReadme: false,
    hasTests: false,
    hasCI: false,
    hasLicense: false,
    openIssues,
    lastCommitMessage: null,
  };

  // Root contents -> README / license / tests / .github (CI)
  try {
    const res = await fetch(`${API}/repos/${owner}/${repo}/contents`, { headers: headers(token) });
    if (res.ok) {
      const items = (await res.json()) as any[];
      const names = items.map((i) => String(i.name).toLowerCase());
      signals.hasReadme = names.some((n) => n.startsWith("readme"));
      signals.hasLicense = names.some((n) => n.startsWith("license") || n.startsWith("licence"));
      signals.hasTests = names.some((n) => /^tests?$|^__tests__$|^spec$/.test(n));
      signals.hasCI = names.includes(".github");
    }
  } catch {
    /* best-effort */
  }

  // If .github exists, confirm a workflows dir for CI.
  if (signals.hasCI) {
    try {
      const res = await fetch(`${API}/repos/${owner}/${repo}/contents/.github/workflows`, {
        headers: headers(token),
      });
      signals.hasCI = res.ok;
    } catch {
      signals.hasCI = false;
    }
  }

  // Last commit message -> refines cause of death.
  try {
    const res = await fetch(`${API}/repos/${owner}/${repo}/commits?per_page=1`, {
      headers: headers(token),
    });
    if (res.ok) {
      const commits = (await res.json()) as any[];
      signals.lastCommitMessage = commits[0]?.commit?.message ?? null;
    }
  } catch {
    /* best-effort */
  }

  return signals;
}
